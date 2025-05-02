import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchForm = () => {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'tags'>('users');
    const [results, setResults] = useState({
        users: [],
        posts: [],
        tags: [],
    });

    useEffect(() => {
        const queryParam = searchParams.get('query');
        if (queryParam) {
            setQuery(queryParam);
            fetchResults(queryParam);
        }
    }, [searchParams]);

    const fetchResults = async (query: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }

            const data = await response.json();
            setResults({
                users: data.users || [],
                posts: data.posts || [],
                tags: data.tags || [],
            });
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', marginTop: '20px' }}>
                <button
                    style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: activeTab === 'users' ? '#007bff' : '#fff',
                        color: activeTab === 'users' ? '#fff' : '#000',
                        border: '1px solid #007bff',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'users' ? 'bold' : 'normal',
                    }}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: activeTab === 'posts' ? '#007bff' : '#fff',
                        color: activeTab === 'posts' ? '#fff' : '#000',
                        border: '1px solid #007bff',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'posts' ? 'bold' : 'normal',
                    }}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </button>
                <button
                    style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: activeTab === 'tags' ? '#007bff' : '#fff',
                        color: activeTab === 'tags' ? '#fff' : '#000',
                        border: '1px solid #007bff',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'tags' ? 'bold' : 'normal',
                    }}
                    onClick={() => setActiveTab('tags')}
                >
                    Tags
                </button>
            </div>

            <div style={{ marginTop: '20px' }}>
                {activeTab === 'users' && (
                    <div>
                        <h3>Users</h3>
                        <ul>
                            {results.users.map((user: any, index: number) => (
                                <li key={index}>{user.username}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {activeTab === 'posts' && (
                    <div>
                        <h3>Posts</h3>
                        <ul>
                            {results.posts.map((post: any, index: number) => (
                                <li key={index}>{post.title}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {activeTab === 'tags' && (
                    <div>
                        <h3>Tags</h3>
                        <ul>
                            {results.tags.map((tag: any, index: number) => (
                                <li key={index}>{tag.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchForm;