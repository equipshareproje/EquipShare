import React from 'react';

const Card = ({
  id,
  name,
  image,
  dailyRate,
  rating,
  reviews,
  verified,
  location,
  available,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer border border-border"
    >
      {/* Image Container */}
      <div className="relative h-52 bg-surface overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {!available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Currently Unavailable</span>
          </div>
        )}
        {verified && (
          <div className="absolute top-3 right-3 bg-success p-1.5 rounded-full flex items-center justify-center shadow-md text-white font-bold">
            VERIFIED
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-text-primary font-bold text-lg mb-2 line-clamp-2 hover:text-primary">
          {name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-text-secondary text-sm mb-3">
          <span className="mr-1 flex-shrink-0">LOCATION</span>
          <span className="truncate">{location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`${
                  i < Math.floor(rating)
                    ? 'text-warning'
                    : 'text-border'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-text-secondary text-sm ml-2">
            ({reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="border-t border-border pt-3">
          <p className="text-text-secondary text-sm">Daily Rate</p>
          <p className="text-primary font-bold text-xl">
            {dailyRate} SAR
            <span className="text-sm text-text-secondary">/day</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
