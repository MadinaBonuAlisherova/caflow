package com.caterflow.ai;

import com.caterflow.ai.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * AI interpretation only — natural language → {@link com.caterflow.search.CateringSearchCriteria}.
 * Does NOT access database, payments, orders, or admin systems directly.
 */
@RestController
@RequestMapping("/api/ai/catering-search")
@RequiredArgsConstructor
public class AiCateringSearchController {

    private final AiCateringSearchService aiSearchService;

    @PostMapping("/parse")
    public ParseCateringSearchResponse parse(@Valid @RequestBody ParseCateringSearchRequest request) {
        return aiSearchService.parse(request.text(), request.locationHint());
    }

    /** Convenience: parse NL text then run deterministic search (no second LLM call). */
    @PostMapping("/execute")
    public AiCateringSearchExecuteResponse execute(@Valid @RequestBody AiCateringSearchExecuteRequest request) {
        ParseCateringSearchResponse parsed = aiSearchService.parse(request.text(), request.locationHint());
        var search = aiSearchService.searchFromParsed(parsed.criteria(), request.vendorType());
        return new AiCateringSearchExecuteResponse(parsed, search);
    }
}
