// Mise à jour de la note moyenne d'un livre
function getAverageRating(book, ratingObject) {
  const ratings = [...book.ratings, ratingObject];
  const totalGrade = ratings.reduce((acc, rating) => acc + rating.grade, 0);

  return Math.round((totalGrade / ratings.length) * 10) / 10;
}

module.exports = getAverageRating;
