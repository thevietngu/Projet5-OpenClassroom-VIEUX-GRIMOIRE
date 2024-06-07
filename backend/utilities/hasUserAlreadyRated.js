
// Vérifier si l'utilisateur a déjà noté ce livre
function hasUserAlreadyRated(userId, ratings) {
  return ratings.some((rating) => rating.userId == userId);
}

module.exports = hasUserAlreadyRated;
