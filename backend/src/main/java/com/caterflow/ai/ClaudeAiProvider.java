package com.caterflow.ai;

import com.caterflow.search.BudgetType;
import com.caterflow.search.CateringSearchCriteria;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Claude Messages API — returns structured JSON only. No database or tool access.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "claude")
public class ClaudeAiProvider implements AiProvider {

    private static final String SYSTEM_PROMPT = """
        You extract catering search criteria from customer text for a marketplace in Uzbekistan.
        Return ONLY valid JSON with these optional fields (use null when not mentioned — NEVER invent):
        eventType (WEDDING|BIRTHDAY|CORPORATE|OFFICE_MEALS|TEAM_BUILDING|CEREMONY),
        vendorType (RESTAURANT|CATERER|CHEF),
        location (city or district name),
        eventDate (ISO yyyy-MM-dd),
        guestCount (integer),
        cuisines (array of strings),
        budgetAmount (integer in UZS som),
        budgetCurrency ("UZS"),
        budgetType (PER_PERSON|TOTAL),
        fulfillmentType (DELIVERY|ONSITE|DINEOUT),
        dietaryRequirements (array of strings),
        requiredServices (array of strings),
        minRating (number).
        """;

    private final AiProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public ClaudeAiProvider(AiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(properties.getClaude().getConnectTimeoutMs()));
        factory.setReadTimeout(Duration.ofMillis(properties.getClaude().getReadTimeoutMs()));
        this.restClient = RestClient.builder()
            .baseUrl("https://api.anthropic.com")
            .requestFactory(factory)
            .build();
    }

    @Override
    public String name() {
        return "claude";
    }

    @Override
    public CateringSearchCriteria extractSearchCriteria(String customerText, String locationHint) {
        String apiKey = properties.getClaude().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiUnavailableException("ANTHROPIC_API_KEY is not configured");
        }

        String userMessage = customerText;
        if (locationHint != null && !locationHint.isBlank()) {
            userMessage += "\n\nCustomer selected area hint: " + locationHint;
        }

        try {
            Map<String, Object> body = Map.of(
                "model", properties.getClaude().getModel(),
                "max_tokens", 1024,
                "system", SYSTEM_PROMPT,
                "messages", List.of(Map.of("role", "user", "content", userMessage)));

            String responseBody = restClient.post()
                .uri("/v1/messages")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

            return parseClaudeResponse(responseBody);
        } catch (RestClientException e) {
            log.warn("Claude API call failed: {}", e.getMessage());
            throw new AiUnavailableException("AI provider temporarily unavailable", e);
        }
    }

    private CateringSearchCriteria parseClaudeResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode content = root.path("content");
            String text = "";
            if (content.isArray() && !content.isEmpty()) {
                text = content.get(0).path("text").asText("");
            }
            text = text.trim();
            if (text.startsWith("```")) {
                text = text.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
            }
            JsonNode json = objectMapper.readTree(text);
            return mapJson(json);
        } catch (Exception e) {
            throw new AiProviderException("Failed to parse AI response as JSON", e);
        }
    }

    private CateringSearchCriteria mapJson(JsonNode json) {
        LocalDate eventDate = null;
        if (json.hasNonNull("eventDate")) {
            try {
                eventDate = LocalDate.parse(json.get("eventDate").asText());
            } catch (Exception ignored) { /* leave null */ }
        }

        BudgetType budgetType = null;
        if (json.hasNonNull("budgetType")) {
            try {
                budgetType = BudgetType.valueOf(json.get("budgetType").asText().toUpperCase());
            } catch (Exception ignored) { /* leave null */ }
        }

        return new CateringSearchCriteria(
            textOrNull(json, "eventType"),
            textOrNull(json, "vendorType"),
            textOrNull(json, "location"),
            eventDate,
            intOrNull(json, "guestCount"),
            stringList(json, "cuisines"),
            intOrNull(json, "budgetAmount"),
            textOrNull(json, "budgetCurrency"),
            budgetType,
            textOrNull(json, "fulfillmentType"),
            stringList(json, "dietaryRequirements"),
            stringList(json, "requiredServices"),
            json.hasNonNull("minRating") ? json.get("minRating").decimalValue() : null);
    }

    private String textOrNull(JsonNode json, String field) {
        return json.hasNonNull(field) ? json.get(field).asText() : null;
    }

    private Integer intOrNull(JsonNode json, String field) {
        return json.hasNonNull(field) ? json.get(field).asInt() : null;
    }

    private List<String> stringList(JsonNode json, String field) {
        if (!json.has(field) || !json.get(field).isArray()) return null;
        List<String> list = new ArrayList<>();
        json.get(field).forEach(n -> {
            if (!n.isNull()) list.add(n.asText());
        });
        return list.isEmpty() ? null : list;
    }
}
