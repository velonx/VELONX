/**
 * EventsPagination Component Examples
 * Feature: events-page-ui-improvements
 * 
 * Demonstrates various usage patterns for the EventsPagination component.
 */

'use client';

import React, { useState } from 'react';
import { EventsPagination } from '../EventsPagination';

/**
 * Example 1: Basic Pagination
 * Standard pagination with all features enabled
 */
export function BasicPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const totalCount = 120;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Basic Pagination</h2>
      <p className="text-muted-foreground">
        Standard pagination with page numbers, navigation buttons, and page size selector.
      </p>

      <div className="border rounded-lg p-4 bg-card">
        <EventsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Current state: Page {currentPage}, Page size {pageSize}
      </div>
    </div>
  );
}

/**
 * Example 2: Load More Variant
 * Alternative pagination style with "Load More" button
 */
export function LoadMoreVariantExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  const totalCount = 120;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Load More Variant</h2>
      <p className="text-muted-foreground">
        Alternative pagination style with a "Load More" button for infinite scroll-like experience.
      </p>

      <div className="border rounded-lg p-4 bg-card">
        <EventsPagination
          variant="load-more"
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Current state: Page {currentPage}, Loading: {isLoading ? 'Yes' : 'No'}
      </div>
    </div>
  );
}

/**
 * Example 3: Many Pages with Ellipsis
 * Demonstrates ellipsis behavior with many pages
 */
export function ManyPagesExample() {
  const [currentPage, setCurrentPage] = useState(10);
  const [pageSize, setPageSize] = useState(12);

  const totalCount = 500;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Many Pages with Ellipsis</h2>
      <p className="text-muted-foreground">
        When there are many pages, ellipsis (...) are shown to keep the UI compact.
      </p>

      <div className="border rounded-lg p-4 bg-card">
        <EventsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCurrentPage(1)}
          className="px-3 py-1 text-sm border rounded hover:bg-accent"
        >
          Jump to First
        </button>
        <button
          onClick={() => setCurrentPage(10)}
          className="px-3 py-1 text-sm border rounded hover:bg-accent"
        >
          Jump to Middle
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 text-sm border rounded hover:bg-accent"
        >
          Jump to Last
        </button>
      </div>
    </div>
  );
}

/**
 * Example 4: Minimal Configuration
 * Pagination without first/last buttons
 */
export function MinimalConfigExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const totalCount = 60;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Minimal Configuration</h2>
      <p className="text-muted-foreground">
        Simplified pagination without first/last buttons for a cleaner look.
      </p>

      <div className="border rounded-lg p-4 bg-card">
        <EventsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          showFirstLast={false}
        />
      </div>
    </div>
  );
}

/**
 * Example 5: Loading State
 * Demonstrates loading state behavior
 */
export function LoadingStateExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  const totalCount = 120;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Loading State</h2>
      <p className="text-muted-foreground">
        All controls are disabled during loading to prevent multiple requests.
      </p>

      <div className="border rounded-lg p-4 bg-card">
        <EventsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
        />
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={isLoading || currentPage >= totalPages}
        className="px-4 py-2 text-sm border rounded hover:bg-accent disabled:opacity-50"
      >
        Trigger Page Change
      </button>
    </div>
  );
}

/**
 * Example 6: Different Page Sizes
 * Shows how pagination adapts to different page sizes
 */
export function PageSizeExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const totalCount = 120;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Different Page Sizes</h2>
      <p className="text-muted-foreground">
        Change the page size to see how pagination adapts. Page resets to 1 when size changes.
      </p>

      <div className="border rounded-lg p-4 bg-card">
        <EventsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <div className="text-sm space-y-1">
        <div>Total items: {totalCount}</div>
        <div>Page size: {pageSize}</div>
        <div>Total pages: {totalPages}</div>
        <div>Current page: {currentPage}</div>
        <div>
          Showing items: {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, totalCount)}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 7: Custom Scroll Target
 * Pagination that scrolls to a specific element
 */
export function CustomScrollTargetExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const totalCount = 120;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Custom Scroll Target</h2>
      <p className="text-muted-foreground">
        Pagination scrolls to a specific element instead of the top of the page.
      </p>

      <div id="events-list" className="border rounded-lg p-4 bg-card min-h-[400px]">
        <h3 className="text-lg font-semibold mb-4">Events List</h3>
        <p className="text-muted-foreground mb-4">
          When you change pages, the page will scroll to this section.
        </p>

        <EventsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          scrollTarget="#events-list"
        />
      </div>
    </div>
  );
}

/**
 * Example 8: All Examples Combined
 * Showcase all examples in one view
 */
export function AllExamples() {
  return (
    <div className="space-y-12 pb-12">
      <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h1 className="text-4xl font-bold mb-2">EventsPagination Examples</h1>
        <p className="text-lg opacity-90">
          Comprehensive examples demonstrating all features and variants
        </p>
      </div>

      <BasicPaginationExample />
      <LoadMoreVariantExample />
      <ManyPagesExample />
      <MinimalConfigExample />
      <LoadingStateExample />
      <PageSizeExample />
      <CustomScrollTargetExample />
    </div>
  );
}

export default AllExamples;
