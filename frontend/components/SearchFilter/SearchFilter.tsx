'use client';

import { useState } from 'react';
import { cardApi } from '@/lib/api';
import type { Label, Member, Card } from '@/types';
import styles from './SearchFilter.module.css';

interface SearchFilterProps {
    boardId: number;
    labels: Label[];
    members: Member[];
}

export default function SearchFilter({ boardId, labels, members }: SearchFilterProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [searchResults, setSearchResults] = useState<Card[]>([]);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await cardApi.search(query, boardId);
            setSearchResults(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Failed to search cards:', error);
        }
    };

    const handleFilter = async () => {
        if (selectedLabels.length === 0 && selectedMembers.length === 0) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await cardApi.filter({
                boardId,
                ...(selectedLabels.length > 0 && { labelIds: selectedLabels.join(',') }),
                ...(selectedMembers.length > 0 && { memberIds: selectedMembers.join(',') }),
            });
            setSearchResults(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Failed to filter cards:', error);
        }
    };

    const toggleLabel = (labelId: number) => {
        setSelectedLabels((prev) =>
            prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
        );
    };

    const toggleMember = (memberId: number) => {
        setSelectedMembers((prev) =>
            prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
        );
    };

    const clearFilters = () => {
        setSelectedLabels([]);
        setSelectedMembers([]);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Labels:</label>
                    <div className={styles.filterOptions}>
                        {labels.map((label) => (
                            <button
                                key={label.id}
                                onClick={() => {
                                    toggleLabel(label.id);
                                    setTimeout(handleFilter, 100);
                                }}
                                className={`${styles.labelFilter} ${selectedLabels.includes(label.id) ? styles.active : ''
                                    }`}
                                style={{ backgroundColor: label.color }}
                            >
                                {label.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Members:</label>
                    <div className={styles.filterOptions}>
                        {members.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => {
                                    toggleMember(member.id);
                                    setTimeout(handleFilter, 100);
                                }}
                                className={`${styles.memberFilter} ${selectedMembers.includes(member.id) ? styles.active : ''
                                    }`}
                            >
                                <img
                                    src={member.avatarUrl || ''}
                                    alt={member.name}
                                    className={styles.memberAvatar}
                                />
                                {member.name}
                            </button>
                        ))}
                    </div>
                </div>

                {(selectedLabels.length > 0 || selectedMembers.length > 0 || searchQuery) && (
                    <button onClick={clearFilters} className={styles.clearButton}>
                        Clear Filters
                    </button>
                )}
            </div>

            {showResults && (
                <div className={styles.results}>
                    <h3 className={styles.resultsTitle}>
                        Found {searchResults.length} card{searchResults.length !== 1 ? 's' : ''}
                    </h3>
                    <div className={styles.resultsList}>
                        {searchResults.map((card) => (
                            <div key={card.id} className={styles.resultCard}>
                                <h4>{card.title}</h4>
                                {card.list && <p className={styles.listName}>in {card.list.title}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
