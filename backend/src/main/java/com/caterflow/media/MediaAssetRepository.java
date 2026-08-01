package com.caterflow.media;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, UUID> {

    Optional<MediaAsset> findByObjectKey(String objectKey);

    List<MediaAsset> findByOwnerTypeAndOwnerIdOrderByCreatedAtDesc(String ownerType, UUID ownerId);
}
