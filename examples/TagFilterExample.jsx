import React, { useState } from 'react';
import TagFilter from '../components/TagFilter';
import '../components/TagFilter.css';

/**
 * TagFilter Example Component
 * 
 * This demonstrates how to use the TagFilter component in Plasmic Studio
 * with various configurations and data sources.
 */
const TagFilterExample = () => {
  // Example state for demonstration
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Example static tag lists
  const productCategories = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 
    'Sports', 'Automotive', 'Health', 'Beauty'
  ];

  const productStatuses = [
    'In Stock', 'Out of Stock', 'Coming Soon', 'Discontinued'
  ];

  // Example page data (simulating what Plasmic Studio would provide)
  const pageData = {
    products: {
      categories: ['Gaming', 'Office', 'Creative', 'Student', 'Professional'],
      brands: ['Apple', 'Samsung', 'Dell', 'HP', 'Lenovo', 'Asus']
    },
    user: {
      preferences: ['Fast Shipping', 'Eco-Friendly', 'Premium Quality', 'Budget-Friendly']
    }
  };

  // Example query data (simulating GraphQL/CMS data)
  const queryData = {
    searchResults: {
      filters: {
        tags: ['JavaScript', 'React', 'Node.js', 'Python', 'Django', 'Vue.js'],
        difficulty: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
      }
    }
  };

  // Handler functions
  const handleCategoryChange = (newSelection, clickedTag) => {
    setSelectedCategories(newSelection);
    console.log('Categories changed:', newSelection, 'Clicked:', clickedTag);
  };

  const handleStatusChange = (newSelection, clickedTag) => {
    setSelectedStatuses(newSelection);
    console.log('Statuses changed:', newSelection, 'Clicked:', clickedTag);
  };

  const handlePreferenceChange = (newSelection, clickedTag) => {
    console.log('Preferences changed:', newSelection, 'Clicked:', clickedTag);
  };

  const handleTagClick = (tag, newSelection) => {
    console.log('Tag clicked:', tag, 'New selection:', newSelection);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>TagFilter Component Examples</h1>
      
      {/* Example 1: Basic static tags */}
      <section style={{ marginBottom: '30px' }}>
        <h2>1. Basic Static Tags</h2>
        <p>Simple tag list passed directly as props</p>
        <TagFilter
          tagList={productCategories}
          tagStyle="pill"
          selectedStyle="filled"
          tagSize="medium"
          multiSelect={true}
          allowDeselect={true}
          onSelectionChange={handleCategoryChange}
          onTagClick={handleTagClick}
        />
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Selected: {selectedCategories.join(', ') || 'None'}
        </div>
      </section>

      {/* Example 2: Single selection */}
      <section style={{ marginBottom: '30px' }}>
        <h2>2. Single Selection</h2>
        <p>Only one tag can be selected at a time</p>
        <TagFilter
          tagList={productStatuses}
          tagStyle="button"
          selectedStyle="outlined"
          tagSize="small"
          multiSelect={false}
          onSelectionChange={handleStatusChange}
        />
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Selected: {selectedStatuses.join(', ') || 'None'}
        </div>
      </section>

      {/* Example 3: Tags from page data */}
      <section style={{ marginBottom: '30px' }}>
        <h2>3. Tags from Page Data</h2>
        <p>Tags extracted from page data using data path</p>
        <TagFilter
          tagDataSource="pageData"
          tagDataPath="products.categories"
          tagField="name"
          tagStyle="chip"
          selectedStyle="highlighted"
          tagSize="medium"
          multiSelect={true}
          pageData={pageData}
        />
      </section>

      {/* Example 4: Tags from query data */}
      <section style={{ marginBottom: '30px' }}>
        <h2>4. Tags from Query Data</h2>
        <p>Tags extracted from GraphQL/CMS query results</p>
        <TagFilter
          tagDataSource="queryData"
          tagDataPath="searchResults.filters.tags"
          tagField="name"
          tagStyle="badge"
          selectedStyle="filled"
          tagSize="small"
          multiSelect={true}
          maxSelections={3}
          queryData={queryData}
        />
      </section>

      {/* Example 5: User preferences with custom styling */}
      <section style={{ marginBottom: '30px' }}>
        <h2>5. User Preferences</h2>
        <p>Custom styling and behavior for user preferences</p>
        <TagFilter
          tagDataSource="pageData"
          tagDataPath="user.preferences"
          tagField="name"
          tagStyle="pill"
          selectedStyle="outlined"
          tagSize="large"
          tagSpacing={12}
          multiSelect={true}
          allowDeselect={false}
          onSelectionChange={handlePreferenceChange}
          style={{
            backgroundColor: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}
        />
      </section>

      {/* Example 6: Difficulty levels with max selection */}
      <section style={{ marginBottom: '30px' }}>
        <h2>6. Difficulty Levels (Max 2 selections)</h2>
        <p>Limited selection with custom styling</p>
        <TagFilter
          tagDataSource="queryData"
          tagDataPath="searchResults.filters.difficulty"
          tagField="name"
          tagStyle="button"
          selectedStyle="filled"
          tagSize="medium"
          multiSelect={true}
          maxSelections={2}
          queryData={queryData}
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
      </section>

      {/* Example 7: Brand selection with different styles */}
      <section style={{ marginBottom: '30px' }}>
        <h2>7. Brand Selection</h2>
        <p>Different visual styles for brand selection</p>
        <TagFilter
          tagDataSource="pageData"
          tagDataPath="products.brands"
          tagField="name"
          tagStyle="pill"
          selectedStyle="highlighted"
          tagSize="large"
          multiSelect={true}
          pageData={pageData}
          style={{
            backgroundColor: '#f0f8ff',
            padding: '16px',
            borderRadius: '8px'
          }}
        />
      </section>

      {/* Summary section */}
      <section style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Current Selections Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <strong>Categories:</strong> {selectedCategories.join(', ') || 'None'}
          </div>
          <div>
            <strong>Statuses:</strong> {selectedStatuses.join(', ') || 'None'}
          </div>
        </div>
      </section>

      {/* Usage instructions */}
      <section style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3>How to Use in Plasmic Studio</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li><strong>Add the component</strong> to your Plasmic Studio page</li>
          <li><strong>Configure tag data source</strong> (props, pageData, queryData, or cmsData)</li>
          <li><strong>Set data path</strong> if using dynamic data sources</li>
          <li><strong>Customize appearance</strong> with style, size, and selection options</li>
          <li><strong>Connect to state</strong> using Plasmic Studio's state management</li>
          <li><strong>Use selections</strong> in other components for filtering</li>
        </ol>
      </section>
    </div>
  );
};

export default TagFilterExample; 