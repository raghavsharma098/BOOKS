'use client';

import React from 'react';
import MyBooksPage from '../page';

export default function CurrentlyReadingPage(): JSX.Element {
  // Wrapper that re-uses the exact My Books page UI so this route
  // renders identically to `/my-books` as requested.
  return <MyBooksPage />;
}
