// SkeletonMessages.jsx
import React, { useMemo } from 'react';
import './skeleton-chats.scss';

export default function SkeletonChats() {
  const skeletons = useMemo(() => {
    const count = Math.floor(Math.random() * 4) + 4;
    return Array.from({ length: count }, (_, i) => i);
  }, []);

  return (
    <>
      {skeletons.map((_, i) => (
        <div key={i} className="skeleton-chats-item skeleton" />
      ))}
    </>
  );
}
