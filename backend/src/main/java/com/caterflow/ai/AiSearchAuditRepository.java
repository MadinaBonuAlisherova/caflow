package com.caterflow.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiSearchAuditRepository extends JpaRepository<AiSearchAudit, UUID> {}
