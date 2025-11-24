/**
 * Pure filtering functions for activity library
 * Designed to be testable and reusable
 */

/**
 * Filter activities by various criteria
 * @param {Array} activities - Array of activity objects
 * @param {Object} filters - Filter criteria object
 * @param {string} filters.category - Category to filter by (empty string = all)
 * @param {string} filters.level - Difficulty level to filter by (empty string = all)
 * @param {Array<string>} filters.festivals - Array of festival tags to match (OR logic)
 * @param {boolean} filters.printable - Whether to filter for printable activities
 * @returns {Array} Filtered array of activities
 */
export function filterActivities(activities, filters = {}) {
  let filtered = [...activities];

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(activity => activity.category === filters.category);
  }

  // Level filter
  if (filters.level) {
    filtered = filtered.filter(activity => activity.difficultyLevel === filters.level);
  }

  // Festival filters (OR logic - match any selected festival)
  if (filters.festivals && filters.festivals.length > 0) {
    filtered = filtered.filter(activity => {
      const activityTags = activity.tags || [];
      return filters.festivals.some(festival => activityTags.includes(festival));
    });
  }

  // Printable filter
  if (filters.printable) {
    filtered = filtered.filter(activity => activity.hasPrintable === true);
  }

  return filtered;
}

/**
 * Search activities by title and description
 * @param {Array} activities - Array of activity objects
 * @param {string} query - Search query string
 * @returns {Array} Filtered array of activities matching the search
 */
export function searchActivities(activities, query = '') {
  // Empty query returns all activities
  if (!query || query.trim() === '') {
    return [...activities];
  }

  const normalizedQuery = query.trim().toLowerCase();

  return activities.filter(activity => {
    const titleMatch = (activity.title || '').toLowerCase().includes(normalizedQuery);
    const descriptionMatch = (activity.description || '').toLowerCase().includes(normalizedQuery);

    return titleMatch || descriptionMatch;
  });
}

/**
 * Combine filtering and search operations
 * Applies filters first, then search on the filtered results
 * @param {Array} activities - Array of activity objects
 * @param {Object} filters - Filter criteria object
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered and searched array of activities
 */
export function combineFilters(activities, filters = {}, searchQuery = '') {
  // Apply filters first
  let result = filterActivities(activities, filters);

  // Then apply search
  result = searchActivities(result, searchQuery);

  return result;
}
