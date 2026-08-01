package com.caterflow.ai;

import com.caterflow.platform.MetaController;
import com.caterflow.search.BudgetType;
import com.caterflow.search.CateringSearchCriteria;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic NL parser — used when Claude is unavailable or as default for local dev.
 * Does NOT call external APIs.
 */
@Component
public class HeuristicAiProvider implements AiProvider {

    private static final Map<String, Pattern> EVENT_KEYWORDS = Map.of(
        "WEDDING", Pattern.compile("\\b(wedding|marriage|to'y)\\b", Pattern.CASE_INSENSITIVE),
        "BIRTHDAY", Pattern.compile("\\bbirthday\\b", Pattern.CASE_INSENSITIVE),
        "CORPORATE", Pattern.compile("\\b(corporate|business|conference)\\b", Pattern.CASE_INSENSITIVE),
        "OFFICE_MEALS", Pattern.compile("\\b(office|lunch|meals?)\\b", Pattern.CASE_INSENSITIVE),
        "TEAM_BUILDING", Pattern.compile("\\bteam[\\s-]?building\\b", Pattern.CASE_INSENSITIVE),
        "CEREMONY", Pattern.compile("\\b(ceremony|celebration)\\b", Pattern.CASE_INSENSITIVE));

    private static final Map<String, Pattern> CUISINE_KEYWORDS = Map.of(
        "Uzbek", Pattern.compile("\\buzbek\\b", Pattern.CASE_INSENSITIVE),
        "Italian", Pattern.compile("\\bitalian\\b", Pattern.CASE_INSENSITIVE),
        "Chinese", Pattern.compile("\\bchinese\\b", Pattern.CASE_INSENSITIVE),
        "Indian", Pattern.compile("\\bindian\\b", Pattern.CASE_INSENSITIVE),
        "Japanese", Pattern.compile("\\bjapanese\\b", Pattern.CASE_INSENSITIVE),
        "BBQ", Pattern.compile("\\b(bbq|barbecue)\\b", Pattern.CASE_INSENSITIVE),
        "Asian Fusion", Pattern.compile("\\basian\\b", Pattern.CASE_INSENSITIVE),
        "European", Pattern.compile("\\beuropean\\b", Pattern.CASE_INSENSITIVE),
        "Halal", Pattern.compile("\\bhalal\\b", Pattern.CASE_INSENSITIVE));

    @Override
    public String name() {
        return "heuristic";
    }

    @Override
    public CateringSearchCriteria extractSearchCriteria(String customerText, String locationHint) {
        if (customerText == null || customerText.isBlank()) {
            return new CateringSearchCriteria(
                null, null, locationHint, null, null, null, null, null, null, null, null, null, null);
        }

        String text = customerText.trim();
        Integer guests = parseGuestCount(text);
        String eventType = parseEventType(text);
        LocalDate eventDate = parseDate(text);
        String location = matchArea(text, locationHint);
        List<String> cuisines = parseCuisines(text);
        Integer budget = parseBudget(text, guests);
        BudgetType budgetType = parseBudgetType(text);
        String fulfillment = parseFulfillment(text);
        List<String> dietary = parseDietary(text);

        return new CateringSearchCriteria(
            eventType,
            null,
            location,
            eventDate,
            guests,
            cuisines.isEmpty() ? null : cuisines,
            budget,
            budget != null ? "UZS" : null,
            budgetType,
            fulfillment,
            dietary.isEmpty() ? null : dietary,
            null,
            null);
    }

    private Integer parseGuestCount(String text) {
        List<Pattern> patterns = List.of(
            Pattern.compile("(\\d{1,4})\\s*guests?", Pattern.CASE_INSENSITIVE),
            Pattern.compile("for\\s+(\\d{1,4})\\s*(?:people|persons|pax|guests?)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(\\d{1,4})\\s*(?:people|persons|pax)\\b", Pattern.CASE_INSENSITIVE));
        for (Pattern p : patterns) {
            Matcher m = p.matcher(text);
            if (m.find()) {
                int n = Integer.parseInt(m.group(1));
                if (n >= 1 && n <= 5000) return n;
            }
        }
        return null;
    }

    private String parseEventType(String text) {
        for (Map.Entry<String, Pattern> e : EVENT_KEYWORDS.entrySet()) {
            if (e.getValue().matcher(text).find()) return e.getKey();
        }
        return null;
    }

    private LocalDate parseDate(String text) {
        Matcher iso = Pattern.compile("\\b(20\\d{2}-\\d{2}-\\d{2})\\b").matcher(text);
        if (iso.find()) return LocalDate.parse(iso.group(1));

        if (Pattern.compile("\\btoday\\b", Pattern.CASE_INSENSITIVE).matcher(text).find())
            return LocalDate.now();
        if (Pattern.compile("\\btomorrow\\b", Pattern.CASE_INSENSITIVE).matcher(text).find())
            return LocalDate.now().plusDays(1);

        Matcher month = Pattern.compile(
            "\\b(\\d{1,2})\\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)(?:\\s+(20\\d{2}))?",
            Pattern.CASE_INSENSITIVE).matcher(text);
        if (month.find()) {
            int year = month.group(3) != null ? Integer.parseInt(month.group(3)) : LocalDate.now().getYear();
            String raw = month.group(1) + " " + month.group(2) + " " + year;
            try {
                return LocalDate.parse(raw, DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH));
            } catch (Exception ignored) {
                try {
                    return LocalDate.parse(raw, DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH));
                } catch (Exception ignored2) { /* fall through */ }
            }
        }
        return null;
    }

    private String matchArea(String text, String hint) {
        String lower = text.toLowerCase(Locale.ROOT);
        for (String area : MetaController.SERVICE_AREAS) {
            if (lower.contains(area.toLowerCase(Locale.ROOT))) return area;
        }
        if (hint != null && !hint.isBlank()) return hint.trim();
        return null;
    }

    private List<String> parseCuisines(String text) {
        List<String> found = new ArrayList<>();
        for (Map.Entry<String, Pattern> e : CUISINE_KEYWORDS.entrySet()) {
            if (e.getValue().matcher(text).find()) found.add(e.getKey());
        }
        return found;
    }

    private Integer parseBudget(String text, Integer guests) {
        Matcher perPerson = Pattern.compile(
            "(\\d[\\d\\s,]*)\\s*(?:som|uzs|uz\\b).{0,30}(?:per\\s*(?:person|guest|head)|/\\s*(?:person|guest|head))",
            Pattern.CASE_INSENSITIVE).matcher(text);
        if (perPerson.find()) {
            return parseInt(perPerson.group(1));
        }
        Matcher total = Pattern.compile(
            "(?:budget|total)[:\\s]*(\\d[\\d\\s,]*)\\s*(?:som|uzs|uz\\b)",
            Pattern.CASE_INSENSITIVE).matcher(text);
        if (total.find() && guests != null && guests > 0) {
            return parseInt(total.group(1)) / guests;
        }
        return null;
    }

    private BudgetType parseBudgetType(String text) {
        if (Pattern.compile("per\\s*(?:person|guest|head)", Pattern.CASE_INSENSITIVE).matcher(text).find())
            return BudgetType.PER_PERSON;
        if (Pattern.compile("\\b(?:budget|total)\\b", Pattern.CASE_INSENSITIVE).matcher(text).find())
            return BudgetType.TOTAL;
        return BudgetType.PER_PERSON;
    }

    private String parseFulfillment(String text) {
        if (Pattern.compile("\\bdine[\\s-]?out\\b", Pattern.CASE_INSENSITIVE).matcher(text).find())
            return "DINEOUT";
        if (Pattern.compile("\\bdelivery\\b|\\bdeliver\\b", Pattern.CASE_INSENSITIVE).matcher(text).find())
            return "DELIVERY";
        if (Pattern.compile("\\bon[\\s-]?site\\b", Pattern.CASE_INSENSITIVE).matcher(text).find())
            return "ONSITE";
        return null;
    }

    private List<String> parseDietary(String text) {
        List<String> out = new ArrayList<>();
        if (Pattern.compile("\\bhalal\\b", Pattern.CASE_INSENSITIVE).matcher(text).find()) out.add("HALAL");
        if (Pattern.compile("\\bvegetarian\\b", Pattern.CASE_INSENSITIVE).matcher(text).find()) out.add("VEGETARIAN");
        if (Pattern.compile("\\bvegan\\b", Pattern.CASE_INSENSITIVE).matcher(text).find()) out.add("VEGAN");
        return out;
    }

    private Integer parseInt(String raw) {
        return Integer.parseInt(raw.replaceAll("[\\s,]", ""));
    }
}
