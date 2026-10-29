// A compilation fixture, not the team's application or design.
import React from "react";
import { createRoot } from "react-dom/client";
import { useMenu } from "../../../src/hooks/useMenu.js";
import { formatPrice } from "../../../src/lib/menu.js";

export function BuildCheck() {
  const { results, loading, error } = useMenu(`${import.meta.env.BASE_URL}data/menu.csv`, { maxPrice: 5 });
  if (loading) return <p>Loading</p>;
  if (error) return <p>{error.message}</p>;
  return <ul>{results.map((item) => <li key={item.id}>{item.name}: {formatPrice(item.price)}</li>)}</ul>;
}
createRoot(document.getElementById("root")).render(<BuildCheck />);
