<?php
declare(strict_types=1);

ini_set('display_errors', '0');
define('WP_USE_THEMES', false);
ob_start();
require '/usr/share/nginx/html/benincosa/wp-load.php';
ob_end_clean();

global $wpdb;

$rows = $wpdb->get_results(
    "SELECT ID, post_date, post_modified, post_name, post_title, post_excerpt, post_content
     FROM {$wpdb->posts}
     WHERE post_type = 'post' AND post_status = 'publish'
     ORDER BY post_date DESC"
);

$termRows = $wpdb->get_results(
    "SELECT tr.object_id, tt.taxonomy, t.term_id, t.name, t.slug
     FROM {$wpdb->term_relationships} tr
     JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
     JOIN {$wpdb->terms} t ON t.term_id = tt.term_id
     WHERE tt.taxonomy IN ('category', 'post_tag')"
);

$termsByPost = [];
foreach ($termRows as $term) {
    $termsByPost[(int) $term->object_id][$term->taxonomy][] = [
        'id' => (int) $term->term_id,
        'name' => html_entity_decode($term->name, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'slug' => $term->slug,
    ];
}

function section_for(object $post, array $categories): string
{
    $names = implode(' ', array_column($categories, 'name'));
    $text = strtolower($post->post_title . ' ' . $names);

    if (preg_match('/housing|california|portland|pdxtotheworld|freedom|business|society/', $text)) {
        return 'Society & Place';
    }
    if (preg_match('/p90x|renaissance|book club|year in review|road ahead|some changes|family|fitness|life/', $text)) {
        return 'Life & Experiments';
    }
    return 'Technology';
}

$posts = [];
foreach ($rows as $row) {
    $categories = $termsByPost[(int) $row->ID]['category'] ?? [];
    $tags = $termsByPost[(int) $row->ID]['post_tag'] ?? [];
    $content = preg_replace('/<script\b[^>]*>[\s\S]*?<\/script>/i', '', $row->post_content) ?? $row->post_content;
    $content = preg_replace('/\s+on\w+=("[^"]*"|\'[^\']*\')/i', '', $content) ?? $content;
    $content = str_ireplace('http://benincosa.com', 'https://benincosa.com', $content);
    $excerptSource = trim($row->post_excerpt) !== '' ? $row->post_excerpt : $content;
    $excerpt = trim(preg_replace('/\s+/', ' ', wp_strip_all_tags($excerptSource)) ?? '');

    $posts[] = [
        'id' => (int) $row->ID,
        'slug' => $row->post_name,
        'title' => html_entity_decode(wp_strip_all_tags($row->post_title), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'date' => str_replace(' ', 'T', $row->post_date),
        'modified' => str_replace(' ', 'T', $row->post_modified),
        'oldUrl' => 'https://benincosa.com/?p=' . $row->ID,
        'excerpt' => mb_substr(html_entity_decode($excerpt, ENT_QUOTES | ENT_HTML5, 'UTF-8'), 0, 360),
        'content' => $content,
        'categories' => $categories,
        'tags' => $tags,
        'section' => section_for($row, $categories),
    ];
}

echo json_encode(
    $posts,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
), "\n";
