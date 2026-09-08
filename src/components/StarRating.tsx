type StarRatingProps = {
  rating: number;
  size?: number;
};

export default function StarRating({ rating, size = 20 }: StarRatingProps) {
  return (
    <div className="flex gap-1" aria-label={`Rated ${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={i <= rating ? '#f9af58' : 'none'}
          stroke={i <= rating ? '#f9af58' : '#d1d1d1'}
          strokeWidth="1"
          aria-hidden="true"
        >
          <path d="M10 1.5L12.5 7L18.5 7.5L14 11.5L15.5 17.5L10 14L4.5 17.5L6 11.5L1.5 7.5L7.5 7L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}