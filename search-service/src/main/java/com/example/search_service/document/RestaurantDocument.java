package com.example.search_service.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;
import java.math.BigDecimal;

@Document(indexName = "restaurants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDocument {

    @Id
    private String id;

    private Long restaurantId;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;

    @Field(type = FieldType.Keyword)
    private String cuisineType;

    @Field(type = FieldType.Keyword)
    private String city;

    private BigDecimal avgRating;
    private Integer deliveryTime;
    private BigDecimal minOrder;
    private boolean isOpen;
    private boolean isActive;

    // Geo location for distance-based search
    @GeoPointField
    private String location; // "lat,lon" format
}