/** ------------------------
   CUSTOM NUNJUCK FILTERS
 ------------------------ */

function addCustomFilters(env) {
  /**
   * Filter to display only directories
   */
  env.addFilter('dirs', function(list) {

      var filtered = [];

      for (var item in list) {
          if (list.hasOwnProperty(item) && list[item].isDir) {
              filtered.push(list[item]);
          }
      }
      return filtered;
  });

  /**
   * Filter that orders folders by rank.
   * This requires an existing "#.rank" file within the folder.
   * If none exists, the default rank for the application will be used.
   */

  env.addFilter('ranked', function(list) {
      return list.sort(function(a, b) {
          return parseInt(a.rank) - parseInt(b.rank);
      });
  });
}

module.exports = addCustomFilters;
