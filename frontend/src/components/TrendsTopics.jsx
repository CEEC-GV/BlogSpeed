import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Button from "./Button.jsx";
import Icon from "./Icon.jsx";

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: '🌐' },
  { id: 'autos_and_vehicles', name: 'Autos and Vehicles', icon: '🚗' },
  { id: 'beauty_and_fashion', name: 'Beauty and Fashion', icon: '💄' },
  { id: 'business_and_finance', name: 'Business and Finance', icon: '💼' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'food_and_drink', name: 'Food and Drink', icon: '🍔' },
  { id: 'games', name: 'Games', icon: '🎮' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'hobbies_and_leisure', name: 'Hobbies and Leisure', icon: '🎨' },
  { id: 'jobs_and_education', name: 'Jobs and Education', icon: '📚' },
  { id: 'law_and_government', name: 'Law and Government', icon: '⚖️' },
  { id: 'pets_and_animals', name: 'Pets and Animals', icon: '🐾' },
  { id: 'politics', name: 'Politics', icon: '🗳️' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'shopping', name: 'Shopping', icon: '🛒' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'travel_and_transportation', name: 'Travel and Transportation', icon: '✈️' },
  { id: 'climate', name: 'Climate', icon: '🌍' }
];

// Location data - simplified list for common countries
const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'CH', name: 'Switzerland' }
];

// Load location from localStorage
const loadLocation = () => {
  try {
    const saved = localStorage.getItem('trendsLocation');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading location:', e);
  }
  return { country: null, state: null, city: null };
};

// Save location to localStorage
const saveLocation = (location) => {
  try {
    localStorage.setItem('trendsLocation', JSON.stringify(location));
  } catch (e) {
    console.error('Error saving location:', e);
  }
};

export default function TrendingTopics({ onSelectTrend, onClose, updateCredits }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [generatingTitles, setGeneratingTitles] = useState(false);
  
  // 🔥 NEW: Related queries state
  const [showRelatedQueries, setShowRelatedQueries] = useState(false);
  const [relatedQueries, setRelatedQueries] = useState([]);
  const [loadingRelatedQueries, setLoadingRelatedQueries] = useState(false);

  // 🔥 NEW: Interest over time state
  const [showInterestOverTime, setShowInterestOverTime] = useState(false);
  const [interestKeyword, setInterestKeyword] = useState(null);
  const [interestData, setInterestData] = useState(null);
  const [loadingInterest, setLoadingInterest] = useState(false);
  const [interestError, setInterestError] = useState("");
  const [timeRange, setTimeRange] = useState('today 12-m');

  // 🔥 NEW: Location state
  const [location, setLocation] = useState(() => loadLocation());
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationForm, setLocationForm] = useState({
    country: '',
    state: '',
    city: ''
  });

  // Initialize location form when modal opens
  useEffect(() => {
    if (showLocationModal) {
      setLocationForm({
        country: location.country || '',
        state: location.state || '',
        city: location.city || ''
      });
    }
  }, [showLocationModal, location]);

  const TIME_RANGES = [
    { value: 'now 1-d', label: 'Past Day' },
    { value: 'now 7-d', label: 'Past 7 Days' },
    { value: 'today 1-m', label: 'Past Month' },
    { value: 'today 3-m', label: 'Past 3 Months' },
    { value: 'today 12-m', label: 'Past Year' },
    { value: 'today 5-y', label: 'Past 5 Years' }
  ];

  // Auto-open location modal if no location is set on first load
  useEffect(() => {
    // Only open modal on mount if no location is saved
    if (!location || !location.country) {
      setShowLocationModal(true);
      // Initialize the form with an empty country
      setLocationForm({
        country: '',
        state: '',
        city: ''
      });
    }
  }, []);

  useEffect(() => {
    if (location.country) {
      fetchTrendingTopics(selectedCategory);
    }
  }, [selectedCategory, location]);

  useEffect(() => {
    if (showInterestOverTime && interestKeyword) {
      fetchInterestData();
    }
  }, [interestKeyword, timeRange, showInterestOverTime, location]);

  const fetchTrendingTopics = async (category) => {
    // Check if location is set
    if (!location.country) {
      setTopics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Build query params with location
      const params = new URLSearchParams({ category });
      params.append('country', location.country);
      if (location.state) params.append('state', location.state);
      if (location.city) params.append('city', location.city);
      
      const res = await api.get(`/trends/discover?${params.toString()}`);
      
      if (res.data.success) {
        setTopics(res.data.topics || []);
      }
    } catch (err) {
      console.error("Fetch Trending Topics Error:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch trending topics");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Fetch related queries when user clicks on a topic
  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setShowRelatedQueries(true);
    setLoadingRelatedQueries(true);
    setRelatedQueries([]);
    setError("");

    try {
      // Build query params with location
      const params = new URLSearchParams({ keyword: topic.keyword });
      if (location.country) {
        params.append('country', location.country);
        if (location.state) params.append('state', location.state);
        if (location.city) params.append('city', location.city);
      }
      
      // Fetch related queries for this trending topic
      const res = await api.get(`/trends/related-queries?${params.toString()}`);
      
      if (res.data.success) {
        // Combine rising and top queries, prioritize rising
        const risingQueries = res.data.risingQueries || [];
        const topQueries = res.data.topQueries || [];
        
        const combined = [
          ...risingQueries.map(q => ({ ...q, type: 'rising' })),
          ...topQueries.filter(tq => 
            !risingQueries.some(rq => rq.query === tq.query)
          ).map(q => ({ ...q, type: 'top' }))
        ];
        
        setRelatedQueries(combined.slice(0, 15));
      }
    } catch (err) {
      console.error("Fetch Related Queries Error:", err);
      setError(err.response?.data?.message || "Failed to fetch related queries");
    } finally {
      setLoadingRelatedQueries(false);
    }
  };

  // 🔥 UPDATED: Pass both trending topic and related query
  const handleSelectRelatedQuery = async (relatedQuery) => {
    setGeneratingTitles(true);
    setError("");

    try {
      const res = await api.post("/admin/blogs/ai/titles", {
        input: relatedQuery.query,              // Selected related query
        trendingTopic: selectedTopic.keyword,   // 🔥 NEW: Original trending topic
        useRelatedQueries: true,
      });

      // Update credits instantly
      if (typeof res.data.remainingCredits === 'number' && updateCredits) {
        console.log('[Credits] TrendsTopics handleSelectRelatedQuery - AI Titles API returned credits:', res.data.remainingCredits);
        updateCredits(res.data.remainingCredits);
      }

      if (res.data.success) {
        onSelectTrend({
          keyword: relatedQuery.query,
          trendingTopic: selectedTopic.keyword,  // 🔥 NEW: Pass to parent
          titles: res.data.titles,
          metaDescriptions: res.data.metaDescriptions,
          slug: res.data.slug,
          keyphrases: res.data.keyphrases,
          serpInsights: res.data.serpInsights,
          trendsData: res.data.trendsData
        });
      }
    } catch (err) {
      console.error("Generate Titles Error:", err);
      setError(err.response?.data?.message || "Failed to generate titles from query");
    } finally {
      setGeneratingTitles(false);
    }
  };

  // 🔥 NEW: Back to topics list
  const handleBackToTopics = () => {
    if (showInterestOverTime) {
      // If viewing interest data, go back to related queries or topics
      setShowInterestOverTime(false);
      setInterestKeyword(null);
      setInterestData(null);
      setInterestError("");
    } else if (showRelatedQueries) {
      // If viewing related queries, go back to topics
      setShowRelatedQueries(false);
      setSelectedTopic(null);
      setRelatedQueries([]);
    }
  };

  // 🔥 NEW: Show interest over time
  const handleShowInterest = (keyword, e) => {
    e.stopPropagation();
    setInterestKeyword(keyword);
    setShowInterestOverTime(true);
    setTimeRange('today 12-m'); // Reset to default
  };

  // 🔥 NEW: Fetch interest over time data
  const fetchInterestData = async () => {
    setLoadingInterest(true);
    setInterestError("");
    
    try {
      const params = {
        keyword: interestKeyword,
        date: timeRange
      };
      if (location.country) {
        params.country = location.country;
        if (location.state) params.state = location.state;
        if (location.city) params.city = location.city;
      }
      
      const res = await api.get('/trends/interest', { params });
      
      if (res.data.success) {
        setInterestData(res.data.data);
      }
    } catch (err) {
      console.error("Fetch Interest Over Time Error:", err);
      setInterestError(err.response?.data?.message || "Failed to fetch interest data");
    } finally {
      setLoadingInterest(false);
    }
  };

  // 🔥 NEW: Location management functions
  const handleLocationApply = () => {
    if (!locationForm.country) {
      setError("Country is required");
      return;
    }
    
    const newLocation = {
      country: locationForm.country,
      state: locationForm.state || null,
      city: locationForm.city || null
    };
    
    setLocation(newLocation);
    saveLocation(newLocation);
    setShowLocationModal(false);
    
    // Refresh topics with new location
    fetchTrendingTopics(selectedCategory);
  };

  const handleLocationCancel = () => {
    setShowLocationModal(false);
  };

  const getLocationLabel = () => {
    if (!location.country) {
      return "Worldwide trends (select location)";
    }
    
    const countryName = COUNTRIES.find(c => c.code === location.country)?.name || location.country;
    
    if (location.city && location.state) {
      return `📍 ${location.city}, ${location.state}, ${countryName}`;
    } else if (location.state) {
      return `📍 ${location.state}, ${countryName}`;
    } else {
      return `📍 ${countryName}`;
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';

    const number = Number(num);

    if (number >= 1_000_000) {
      return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }

    if (number >= 1_000) {
      return (number / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }

    return number.toString();
  };


  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-5xl max-h-[90vh] bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              {(showRelatedQueries || showInterestOverTime) && (
                <button
                  onClick={handleBackToTopics}
                  className="text-white/60 hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {showInterestOverTime 
                    ? 'Interest Over Time'
                    : showRelatedQueries 
                      ? 'Select a Topic' 
                      : 'Discover Trending Topics'
                  }
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  {showInterestOverTime
                    ? interestKeyword
                    : showRelatedQueries 
                      ? `Related to: ${selectedTopic?.keyword}`
                      : getLocationLabel()
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLocationModal(true)}
                className="px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
                title="Set Location"
              >
                Set Location 🌍
              </button>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category Filter - Only show when not viewing related queries or interest */}
          {!showRelatedQueries && !showInterestOverTime && (
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Range Filter - Only show when viewing interest over time */}
          {showInterestOverTime && (
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {TIME_RANGES.map(range => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      timeRange === range.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* INTEREST OVER TIME VIEW */}
            {showInterestOverTime && (
              <>
                {loadingInterest ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-purple-500"></div>
                    <p className="text-sm text-white/50 mt-4">Loading interest data...</p>
                  </div>
                ) : interestError ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                    <p className="text-sm text-red-400 mb-3">{interestError}</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={fetchInterestData}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Averages */}
                    {interestData?.interest_over_time?.averages && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {interestData.interest_over_time.averages.map((avg, index) => (
                          <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-white/50 mb-1">Average Interest</p>
                            <p className="text-2xl font-bold text-white">{avg.value}</p>
                            {avg.extracted_value && (
                              <p className="text-xs text-white/40 mt-1">
                                {avg.extracted_value}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timeline Data */}
                    {interestData?.interest_over_time?.timeline_data ? (
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <div className="relative h-[300px]">
                            {(() => {
                              const timelineData = interestData.interest_over_time.timeline_data;
                              const maxValue = Math.max(...timelineData.map(i => i.values?.[0]?.value || 0));
                              const minValue = Math.min(...timelineData.map(i => i.values?.[0]?.value || 0));
                              const range = maxValue - minValue || 1;
                              
                              // Create SVG path for the line
                              const points = timelineData.map((item, index) => {
                                const value = item.values?.[0]?.value || 0;
                                const x = (index / (timelineData.length - 1)) * 100;
                                const y = 100 - ((value - minValue) / range) * 100;
                                return { x, y, value, date: item.date };
                              });

                              const pathData = points.map((point, index) => 
                                `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`
                              ).join(' ');

                              // Create area fill path
                              const areaData = `M 0,100 ${pathData} L 100,100 Z`;

                              return (
                                <svg 
                                  viewBox="0 0 100 100" 
                                  preserveAspectRatio="none"
                                  className="w-full h-full"
                                >
                                  {/* Grid lines */}
                                  {[0, 25, 50, 75, 100].map(y => (
                                    <line
                                      key={y}
                                      x1="0"
                                      y1={y}
                                      x2="100"
                                      y2={y}
                                      stroke="rgba(255,255,255,0.05)"
                                      strokeWidth="0.2"
                                      vectorEffect="non-scaling-stroke"
                                    />
                                  ))}
                                  
                                  {/* Area fill with gradient */}
                                  <defs>
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.4" />
                                      <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.05" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d={areaData}
                                    fill="url(#areaGradient)"
                                  />
                                  
                                  {/* Line */}
                                  <path
                                    d={pathData}
                                    fill="none"
                                    stroke="rgb(168, 85, 247)"
                                    strokeWidth="0.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                  
                                  {/* Data points */}
                                  {points.map((point, index) => (
                                    <g key={index}>
                                      <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="0.8"
                                        fill="rgb(168, 85, 247)"
                                        vectorEffect="non-scaling-stroke"
                                      />
                                      <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="1.5"
                                        fill="none"
                                        stroke="rgb(168, 85, 247)"
                                        strokeWidth="0.3"
                                        opacity="0.5"
                                        vectorEffect="non-scaling-stroke"
                                      />
                                    </g>
                                  ))}
                                </svg>
                              );
                            })()}
                          </div>

                          {/* Y-axis labels */}
                          <div className="flex justify-between items-center mt-2 text-xs text-white/40">
                            <span>{Math.min(...interestData.interest_over_time.timeline_data.map(i => i.values?.[0]?.value || 0))}</span>
                            <span>{Math.max(...interestData.interest_over_time.timeline_data.map(i => i.values?.[0]?.value || 0))}</span>
                          </div>
                        </div>

                        {/* Data table below chart */}
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                          {interestData.interest_over_time.timeline_data.map((item, index) => {
                            const value = item.values?.[0]?.value || 0;
                            return (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                              >
                                <span className="text-xs text-white/70">{item.date}</span>
                                <span className="text-sm font-medium text-white">{value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-white/50 text-sm">No timeline data available</p>
                      </div>
                    )}

                    {/* Info Box */}
                    {interestData?.search_metadata && (
                      <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-300 font-medium mb-2">ℹ️ About this data</p>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Numbers represent search interest relative to the highest point on the chart for the given region and time. 
                          A value of 100 is the peak popularity for the term. A value of 50 means that the term is half as popular.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* TRENDING TOPICS LIST */}
            {!showRelatedQueries && !showInterestOverTime && (
              <>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-purple-500"></div>
                    <p className="text-sm text-white/50 mt-4">Loading trending topics...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                    <p className="text-sm text-red-400 mb-3">{error}</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchTrendingTopics(selectedCategory)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-white/30 text-5xl mb-4">📊</div>
                    <p className="text-white/50 text-sm">No trending topics found in this category</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topics.map((topic, index) => (
                      <div
                        key={index}
                        className={`group rounded-xl border p-4 transition cursor-pointer ${
                          selectedTopic?.keyword === topic.keyword
                            ? 'border-purple-500/50 bg-purple-500/10'
                            : 'border-white/10 hover:border-white/20 hover:shadow-sm bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => handleTopicClick(topic)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-purple-400">#{index + 1}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-white">
                                {topic.keyword}
                              </h3>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                                
                                  <Icon icon="chart-line" className="text-purple-400" /> {formatNumber(topic.traffic)}{" "}
                                  <Icon icon="magnifying-glass" className="text-purple-400" /> {formatNumber(topic.searchVolume)}
                                  <Icon icon="star" className="text-purple-400" variant="regular"/> {topic.trendScore}
                                
                              </div>
                            </div>

                            {topic.relatedQueries && topic.relatedQueries.length > 0 && (
                              <div>
                                <p className="text-xs text-white/40 mb-1.5">Related searches</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {topic.relatedQueries.slice(0, 4).map((query, qi) => (
                                    <span
                                      key={qi}
                                      className="inline-flex items-center px-2 py-1 rounded bg-white/10 text-xs text-white/70 border border-white/10"
                                    >
                                      {query}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-shrink-0 gap-2">
                            <button
                              className="px-2 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-white text-sm font-medium rounded-lg  transition opacity-0 group-hover:opacity-100"
                              onClick={(e) => handleShowInterest(topic.keyword, e)}
                              title="view interest over time"
                            >
                              <Icon icon="chart-line" className="inline-block mr-2" />
                            </button>
                            <button
                              className="px-2 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-white text-sm font-medium rounded-lg  transition opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTopicClick(topic);
                              }}
                            >
                              <Icon icon="arrow-right" className="inline-block mr-2" />
                            </button>
                            
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* RELATED QUERIES LIST */}
            {showRelatedQueries && !showInterestOverTime && (
              <>
                {loadingRelatedQueries ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-purple-500"></div>
                    <p className="text-sm text-white/50 mt-4">Finding related topics...</p>
                  </div>
                ) : relatedQueries.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-white/30 text-5xl mb-4">🔍</div>
                    <p className="text-white/50 text-sm">No related topics found</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={handleBackToTopics}
                    >
                      Back to Trends
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relatedQueries.map((relatedQuery, index) => (
                      <div
                        key={index}
                        className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 hover:border-white/20 hover:shadow-sm transition cursor-pointer"
                        onClick={() => !generatingTitles && handleSelectRelatedQuery(relatedQuery)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-white">
                                {relatedQuery.query}
                              </h4>
                              {/* 🔥 NEW: Info button for related queries */}
                              <button
                                onClick={(e) => handleShowInterest(relatedQuery.query, e)}
                                className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                                title="View interest over time"
                              >
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              {relatedQuery.type === 'rising' && (
                                <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-xs font-medium text-orange-400">
                                  🔥 Rising
                                </span>
                              )}
                            </div>
                            {relatedQuery.formattedValue && (
                              <p className="text-xs text-white/50">
                                Search interest: {relatedQuery.formattedValue}
                              </p>
                            )}
                          </div>

                          <div className="flex-shrink-0 ml-4">
                            {generatingTitles ? (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-purple-500"></div>
                                <span className="text-sm font-medium text-white/70">Generating...</span>
                              </div>
                            ) : (
                              <button
                                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectRelatedQuery(relatedQuery);
                                }}
                              >
                                Generate Blog
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">
                {showInterestOverTime
                  ? 'Data from Google Trends'
                  : showRelatedQueries 
                    ? `${relatedQueries.length} related topics found`
                    : `${topics.length} trending topics found`
                }
              </p>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Set Location</h3>
              <p className="text-sm text-white/50 mt-1">Select your location for localized trends</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Country <span className="text-red-400">*</span>
                </label>
                <select
                  value={locationForm.country}
                  onChange={(e) => {
                    setLocationForm({
                      country: e.target.value,
                      state: '',
                      city: ''
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code} className="bg-black">
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  State / Region <span className="text-white/40 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={locationForm.state}
                  onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })}
                  placeholder="e.g., Karnataka, California"
                  disabled={!locationForm.country}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  City / Location <span className="text-white/40 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                  placeholder="e.g., Bangalore, New York"
                  disabled={!locationForm.state}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={handleLocationCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLocationApply}
                disabled={!locationForm.country}
              >
                Apply Location
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}