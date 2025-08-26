import React, { useState } from "react";
import styles from "./BookFinder.module.css";

const BookFinder = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [authorFilter, setAuthorFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortOption, setSortOption] = useState("");

  // toggle filter dropdown
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setBooks([]);

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (data.docs && data.docs.length > 0) {
        setBooks(data.docs.slice(0, 100)); // load more for filtering
      } else {
        setError("No books found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch books.");
    } finally {
      setLoading(false);
    }
  };

  // apply filters
  let filteredBooks = books.filter((book) => {
    const matchesAuthor = authorFilter
      ? book.author_name?.some((a) =>
          a.toLowerCase().includes(authorFilter.toLowerCase())
        )
      : true;

    const matchesYear = yearFilter
      ? book.first_publish_year?.toString() === yearFilter
      : true;

    return matchesAuthor && matchesYear;
  });

  // apply sorting
  if (sortOption === "year-desc") {
    filteredBooks.sort(
      (a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0)
    );
  } else if (sortOption === "year-asc") {
    filteredBooks.sort(
      (a, b) => (a.first_publish_year || 0) - (b.first_publish_year || 0)
    );
  } else if (sortOption === "title-asc") {
    filteredBooks.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (sortOption === "title-desc") {
    filteredBooks.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  }

  return (
    <div className={styles.bookFinder}>
      <h2 className={styles.heading}>📚 Book Finder</h2>

      {/* Search Box + Filter Button */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Enter book title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Search
        </button>
        <button
          type="button"
          className={styles.filterButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Close Filters" : "Filters"}
        </button>
      </form>

      {/* Filters Dropdown */}
      {showFilters && (
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Filter by author..."
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Filter by year..."
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={styles.input}
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={styles.input}
          >
            <option value="">Sort By...</option>
            <option value="year-desc">Year (Newest → Oldest)</option>
            <option value="year-asc">Year (Oldest → Newest)</option>
            <option value="title-asc">Title (A → Z)</option>
            <option value="title-desc">Title (Z → A)</option>
          </select>
        </div>
      )}

      {/* Loading/Error */}
      {loading && <p className={styles.info}>Searching...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {/* Results */}
      <div className={styles.results}>
        {filteredBooks.map((book, idx) => {
          const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150x220.png?text=No+Cover";

          return (
            <div key={idx} className={styles.card}>
              <img src={coverUrl} alt={book.title} className={styles.cover} />
              <h3>{book.title}</h3>
              <p>
                {book.author_name?.join(", ") || "Unknown Author"}
                <br />
                {book.first_publish_year || "N/A"}
              </p>
              <a
                href={`https://openlibrary.org${book.key}`}
                target="_blank"
                rel="noreferrer"
                className={styles.link}
              >
                View Details
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookFinder;
