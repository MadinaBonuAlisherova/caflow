package com.caterflow.ai;

import com.caterflow.ai.dto.ParseCateringSearchResponse;
import com.caterflow.search.CateringSearchCriteria;
import com.caterflow.search.SearchCriteriaNormalizer;
import com.caterflow.search.CateringSearchService;
import com.caterflow.search.dto.CateringSearchResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiCateringSearchService {

    private final AiProvider aiProvider;
    private final HeuristicAiProvider heuristicProvider;
    private final SearchCriteriaNormalizer normalizer;
    private final CateringSearchService searchService;
    private final AiSearchAuditRepository auditRepository;
    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    public ParseCateringSearchResponse parse(String text, String locationHint) {
        long start = System.currentTimeMillis();
        boolean fallbackUsed = false;
        String providerName = aiProvider.name();
        CateringSearchCriteria raw;

        try {
            raw = aiProvider.extractSearchCriteria(text, locationHint);
        } catch (AiUnavailableException ex) {
            if (aiProvider instanceof HeuristicAiProvider) {
                throw ex;
            }
            log.warn("Primary AI provider unavailable ({}), falling back to heuristic", providerName);
            raw = heuristicProvider.extractSearchCriteria(text, locationHint);
            providerName = heuristicProvider.name();
            fallbackUsed = true;
        }

        if (locationHint != null && !locationHint.isBlank()
            && (raw.location() == null || raw.location().isBlank())) {
            raw = mergeLocation(raw, locationHint);
        }

        CateringSearchCriteria criteria = normalizer.normalize(raw);
        long ms = System.currentTimeMillis() - start;

        saveAudit(text, criteria, providerName, true, null, (int) ms);

        log.info("AI parse completed provider={} ms={} location={}", providerName, ms, criteria.location());
        return new ParseCateringSearchResponse(criteria, providerName, ms, fallbackUsed);
    }

    public CateringSearchResponse searchFromParsed(CateringSearchCriteria parsed, String vendorType) {
        CateringSearchCriteria criteria = parsed;
        if (vendorType != null && !vendorType.isBlank()
            && (criteria.vendorType() == null || criteria.vendorType().isBlank())) {
            criteria = new CateringSearchCriteria(
                criteria.eventType(),
                vendorType,
                criteria.location(),
                criteria.eventDate(),
                criteria.guestCount(),
                criteria.cuisines(),
                criteria.budgetAmount(),
                criteria.budgetCurrency(),
                criteria.budgetType(),
                criteria.fulfillmentType(),
                criteria.dietaryRequirements(),
                criteria.requiredServices(),
                criteria.minRating());
            criteria = normalizer.normalize(criteria);
        }
        return searchService.search(criteria, true);
    }

    private CateringSearchCriteria mergeLocation(CateringSearchCriteria raw, String locationHint) {
        return new CateringSearchCriteria(
            raw.eventType(),
            raw.vendorType(),
            locationHint,
            raw.eventDate(),
            raw.guestCount(),
            raw.cuisines(),
            raw.budgetAmount(),
            raw.budgetCurrency(),
            raw.budgetType(),
            raw.fulfillmentType(),
            raw.dietaryRequirements(),
            raw.requiredServices(),
            raw.minRating());
    }

    private void saveAudit(
        String text,
        CateringSearchCriteria criteria,
        String provider,
        boolean success,
        String error,
        int ms) {
        try {
            String json = objectMapper.writeValueAsString(criteria);
            auditRepository.save(AiSearchAudit.builder()
                .originalText(truncate(text, 4000))
                .normalizedJson(json)
                .provider(provider)
                .model(provider.equals("claude") ? aiProperties.getClaude().getModel() : null)
                .success(success)
                .errorMessage(error)
                .processingMs(ms)
                .build());
        } catch (JsonProcessingException e) {
            log.debug("Could not serialize audit criteria: {}", e.getMessage());
        }
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max);
    }
}
