#!/usr/bin/env python3
"""
Generate complete SQL INSERT statement for all CSV locations
"""

import csv
import sys

def escape_sql_string(value):
    """Escape single quotes for SQL"""
    if value is None or value == '':
        return 'NULL'
    # Replace single quotes with two single quotes for SQL escaping
    escaped = value.replace("'", "''")
    return f"'{escaped}'"

def generate_sql():
    csv_file = './public/national_removals_uk_locations_10k_with_nearest copy.csv'

    print("-- Generated SQL Import Script for All UK Locations")
    print("-- Total Records: Will be counted after parsing")
    print("-- Generated automatically from CSV data\n")

    print("INSERT INTO locations (")
    print("  domain, city, nearest_1, nearest_2, nearest_3, nearest_areas,")
    print("  city_slug, county, postcode, phone, email, address1, address2,")
    print("  reviews_platform, reviews_score, accredited, nearby_areas, area_links,")
    print("  hero_image, map_embed, map_link, opening_hours")
    print(") VALUES")

    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

        for i, row in enumerate(rows):
            # Extract values
            values = [
                escape_sql_string(row.get('DOMAIN', 'https://nationalremovalsandstorage.co.uk/')),
                escape_sql_string(row['CITY']),
                escape_sql_string(row.get('Nearest_1', '')),
                escape_sql_string(row.get('Nearest_2', '')),
                escape_sql_string(row.get('Nearest_3', '')),
                escape_sql_string(row.get('Nearest_Areas', '')),
                escape_sql_string(row['CITY_SLUG']),
                escape_sql_string(row.get('COUNTY', '')),
                escape_sql_string(row.get('POSTCODE', '')),
                escape_sql_string(row.get('PHONE', '(0800) 0472607')),
                escape_sql_string(row.get('EMAIL', 'sales@nationalremovalsandstorage.co.uk')),
                escape_sql_string(row.get('ADDRESS1', '')),
                escape_sql_string(row.get('ADDRESS2', '')),
                escape_sql_string(row.get('REVIEWS_PLATFORM', 'Google')),
                escape_sql_string(row.get('REVIEWS_SCORE', '')),
                escape_sql_string(row.get('ACCREDITED', 'Yes')),
                escape_sql_string(row.get('NEARBY_AREAS', '')),
                escape_sql_string(row.get('AREA_LINKS', '')),
                escape_sql_string(row.get('HERO_IMAGE', '')),
                escape_sql_string(row.get('MAP_EMBED', '')),
                escape_sql_string(row.get('MAP_LINK', '')),
                escape_sql_string(row.get('OPENING_HOURS', 'Mon–Sat 08:00–18:00; Sun Closed'))
            ]

            # Format the VALUES line
            values_str = ', '.join(values)

            # Add comma if not last row
            comma = ',' if i < len(rows) - 1 else ''

            print(f"  ({values_str}){comma}")

        print("\nON CONFLICT (city_slug) DO UPDATE SET")
        print("  domain = EXCLUDED.domain,")
        print("  city = EXCLUDED.city,")
        print("  nearest_1 = EXCLUDED.nearest_1,")
        print("  nearest_2 = EXCLUDED.nearest_2,")
        print("  nearest_3 = EXCLUDED.nearest_3,")
        print("  nearest_areas = EXCLUDED.nearest_areas,")
        print("  county = EXCLUDED.county,")
        print("  postcode = EXCLUDED.postcode,")
        print("  phone = EXCLUDED.phone,")
        print("  email = EXCLUDED.email,")
        print("  address1 = EXCLUDED.address1,")
        print("  address2 = EXCLUDED.address2,")
        print("  reviews_platform = EXCLUDED.reviews_platform,")
        print("  reviews_score = EXCLUDED.reviews_score,")
        print("  accredited = EXCLUDED.accredited,")
        print("  nearby_areas = EXCLUDED.nearby_areas,")
        print("  area_links = EXCLUDED.area_links,")
        print("  hero_image = EXCLUDED.hero_image,")
        print("  map_embed = EXCLUDED.map_embed,")
        print("  map_link = EXCLUDED.map_link,")
        print("  opening_hours = EXCLUDED.opening_hours,")
        print("  updated_at = now();")

        print(f"\n-- Total records processed: {len(rows)}")
        print("\n-- Verify import:")
        print("SELECT COUNT(*) as total_locations FROM locations;")
        print("SELECT city, city_slug FROM locations ORDER BY city LIMIT 10;")

if __name__ == '__main__':
    try:
        generate_sql()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
