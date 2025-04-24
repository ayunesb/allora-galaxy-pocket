import { useState, useEffect } from 'react';
import { Plugin } from '@/types/plugin';

type SortOrder = "popular" | "newest" | "name";

export function usePluginFilters(plugins: Plugin[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>(plugins);

  useEffect(() => {
    let results = plugins;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(plugin => 
        plugin.name.toLowerCase().includes(query) || 
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (activeCategory !== "all") {
      results = results.filter(plugin => plugin.category === activeCategory);
    }
    
    // Apply sorting
    switch (sortOrder) {
      case "newest":
        results = [...results].sort(() => Math.random() - 0.5); // Simulated for now
        break;
      case "name":
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "popular":
      default:
        // Keep original order for popular (assuming they're already sorted)
        break;
    }
    
    setFilteredPlugins(results);
  }, [searchQuery, activeCategory, sortOrder, plugins]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSortOrder('popular');
  };

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortOrder,
    setSortOrder,
    filteredPlugins,
    resetFilters
  };
}
