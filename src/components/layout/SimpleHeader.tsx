"use client";

import React from 'react';
import Link from 'next/link';

const SimpleHeader = () => {
    return (
        <header style={{
            backgroundColor: '#1f2937',
            padding: '1rem',
            borderBottom: '1px solid #374151'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link href="/" style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                }}>
                    Nexor Records
                </Link>
                
                <nav style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/new" style={{
                        color: '#9ca3af',
                        textDecoration: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        transition: 'all 0.2s'
                    }}>
                        Novidades
                    </Link>
                    <Link href="/trending" style={{
                        color: '#9ca3af',
                        textDecoration: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        transition: 'all 0.2s'
                    }}>
                        Trending
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default SimpleHeader;
