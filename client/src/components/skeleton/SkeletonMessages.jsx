// SkeletonMessages.jsx
import React, { useMemo } from 'react';
import './skeleton-messages.scss';

export default function SkeletonMessages() {
  const skeletons = useMemo(() => {
    const count = Math.floor(Math.random() * 4) + 6;
    const arr = [];
    for (let i = 0; i < count; i++) {
      const isMe = Math.random() < 0.5;
      const width = Math.floor(Math.random() * 20) + 25;
      const heights = [36];
      const height = heights[Math.floor(Math.random() * heights.length)];
      arr.push({ isMe, width, height });
    }
    return arr;
  }, []);

  return (
    <>
      {skeletons.map((item, i) => (
        <div key={i} className={`message-flex ${item.isMe ? 'my' : ''}`}>
          <div
            className="skeleton skeleton-msg"
            style={{ width: `${item.width}%`, height: `${item.height}px` }}
          />
        </div>
      ))}
    </>
  );
}
