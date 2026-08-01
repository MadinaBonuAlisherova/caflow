package com.caterflow.ai;

import com.caterflow.search.CateringSearchCriteria;

/**
 * Interprets natural language into structured search criteria only.
 * Implementations must NOT access the database, payments, orders, or admin systems.
 */
public interface AiProvider {

    String name();

    /**
     * @param customerText natural language from the customer
     * @param locationHint optional area selected in the UI (may be null)
     */
    CateringSearchCriteria extractSearchCriteria(String customerText, String locationHint);
}
