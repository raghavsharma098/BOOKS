'use client';

import React from 'react';
import MyBooksPage from '../page';

export default function CompletedPage(): JSX.Element {
  // Re-use the same MyBooksPage UI so `/my-books/completed` renders
  // identically (but with the Completed tab active via pathname).
  return <MyBooksPage />;
}
