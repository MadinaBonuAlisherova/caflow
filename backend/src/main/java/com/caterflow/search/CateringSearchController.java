package com.caterflow.search;

import com.caterflow.search.dto.CateringSearchResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * Structured catering search — never calls the LLM.
 */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class CateringSearchController {

    private final CateringSearchService searchService;

    @PostMapping("/catering")
    public CateringSearchResponse search(@Valid @RequestBody CateringSearchCriteria criteria) {
        return searchService.search(criteria, false);
    }
}
