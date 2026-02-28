import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Lightbulb, Database, Terminal, CheckCircle, Info, Trophy, ChevronRight, AlertCircle, Loader2, History, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeQuery, getHint, getAssignments, saveAttempt, getAttempts } from '../../services/api';
import './AssignmentPage.scss';

const AssignmentPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [query, setQuery] = useState('-- Start your analysis here\nSELECT * FROM students LIMIT 10;');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [hint, setHint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Initial load
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const res = await getAssignments();
                if (res.data && res.data.length > 0) {
                    setAssignments(res.data);
                    setActiveAssignment(res.data[0]);
                }
            } catch (err) {
                setError("Failed to connect to the database. Please ensure servers are running.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Load attempts when active assignment changes
    useEffect(() => {
        if (activeAssignment) {
            const fetchHistory = async () => {
                try {
                    const res = await getAttempts(activeAssignment._id);
                    setAttempts(res.data);
                    // Mark as correct if any attempt was correct
                    if (res.data.some(a => a.isCorrect)) setIsCorrect(true);
                } catch (err) {
                    console.error("History fetch failed");
                }
            };
            fetchHistory();
        }
    }, [activeAssignment]);

    const handleExecute = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setHint(null);
        setIsCorrect(false);
        try {
            const data = await executeQuery(query);
            setResults(data);

            // Validation logic
            const normalizedUser = query.toUpperCase().replace(/\s/g, '').replace(';', '');
            const normalizedSol = activeAssignment?.solutionQuery?.toUpperCase().replace(/\s/g, '').replace(';', '');
            const correct = normalizedUser.includes(normalizedSol) || normalizedUser === normalizedSol;

            if (correct) {
                setIsCorrect(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#818cf8', '#2dd4bf', '#f472b6']
                });
            }

            // Save Attempt to MongoDB
            await saveAttempt({
                assignmentId: activeAssignment._id,
                query: query,
                isCorrect: correct
            });

            // Refresh History
            const histRes = await getAttempts(activeAssignment._id);
            setAttempts(histRes.data);

        } catch (err) {
            setError(err.error || err.message || 'SQL Execution Error');
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleHint = async () => {
        if (!activeAssignment) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getHint(query, {
                question: activeAssignment.description,
                schema: activeAssignment.expectedSchema
            });
            setHint(data.hint);
        } catch (err) {
            console.error('Hint Error:', err);
            setError(err.error || err.message || "AI Tutor is currently busy. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const selectAssignment = (asm) => {
        setActiveAssignment(asm);
        setQuery('-- Type your query here\n');
        setResults(null);
        setError(null);
        setHint(null);
        setIsCorrect(false);
    }

    return (
        <div className="assignment-page full-layout">
            <aside className="assignment-sidebar">
                <div className="sidebar-header">
                    <div className="logo-sq">C</div>
                    <span>Curriculum</span>
                </div>
                <div className="sidebar-list">
                    {assignments.map((asm, idx) => (
                        <div
                            key={asm._id}
                            className={`sidebar-item ${activeAssignment?._id === asm._id ? 'active' : ''}`}
                            onClick={() => selectAssignment(asm)}
                        >
                            <span className="order">{idx + 1}</span>
                            <div className="info">
                                <p className="title">{asm.title}</p>
                                <p className="diff">{asm.difficulty}</p>
                            </div>
                            {attempts.some(a => a.assignmentId === asm._id && a.isCorrect) && (
                                <CheckCircle size={14} className="done-icon" />
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            <div className="assignment-main">
                <header className="assignment-page__header">
                    <div className="header-breadcrumbs">
                        <span>Modules</span> / <span>Fundamentals</span> / <strong>{activeAssignment?.title}</strong>
                    </div>
                    <h1>{activeAssignment?.title || 'Loading...'}</h1>
                </header>

                <main className="assignment-page__flex-container">
                    {/* Left: Challenge & Results */}
                    <div className="content-left">
                        <section className="panel challenge-panel">
                            <div className="panel-tag"><Info size={14} /> Objective</div>
                            <p className="description">{activeAssignment?.description}</p>

                            <div className="schema-view">
                                <h3>Schema Explorer</h3>
                                {activeAssignment && Object.keys(activeAssignment.expectedSchema).map(table => (
                                    <div key={table} className="table-block">
                                        <div className="name"><Database size={14} /> {table}</div>
                                        <div className="fields">
                                            {activeAssignment.expectedSchema[table].map(f => (
                                                <span key={f} className="field-chip">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="panel results-panel">
                            <div className="panel-header">
                                <div className="title"><Terminal size={16} /> Console</div>
                                {results && <div className="meta">{results.rowCount} data points found</div>}
                            </div>

                            <div className="console-output">
                                {isCorrect && (
                                    <div className="banner-success">
                                        <Trophy size={24} />
                                        <div className="text">
                                            <h4>Mission Accomplished!</h4>
                                            <p>Data retrieved successfully. Well done!</p>
                                        </div>
                                    </div>
                                )}

                                {hint && (
                                    <div className="banner-hint">
                                        <Lightbulb size={18} />
                                        <div className="text"><strong>AI Tutor:</strong> {hint}</div>
                                    </div>
                                )}

                                {error && (
                                    <div className="banner-error">
                                        <AlertCircle size={18} />
                                        <p>{error}</p>
                                    </div>
                                )}

                                {results ? (
                                    <div className="data-table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>{results.fields.map(f => <th key={f}>{f}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                {results.data.map((row, i) => (
                                                    <tr key={i}>{results.fields.map(f => <td key={f}>{row[f]}</td>)}</tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    !error && !hint && !isCorrect && (
                                        <div className="empty-state">
                                            <Database size={40} />
                                            <p>Output will appear here after execution</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Editor & History */}
                    <div className="content-right">
                        <section className="panel editor-panel">
                            <div className="panel-header">
                                <div className="title">query.sql</div>
                                <div className="actions">
                                    <button onClick={handleHint} className="btn-hint" disabled={loading}><Lightbulb size={16} /> Hint</button>
                                    <button onClick={handleExecute} className="btn-run" disabled={loading}>
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                                        Run
                                    </button>
                                </div>
                            </div>
                            <div className="monaco-wrapper">
                                <Editor
                                    height="100%"
                                    defaultLanguage="sql"
                                    theme="vs-dark"
                                    value={query}
                                    onChange={setQuery}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 16,
                                        fontFamily: 'JetBrains Mono',
                                        padding: { top: 20 },
                                        automaticLayout: true,
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'all',
                                        scrollBeyondLastLine: false
                                    }}
                                />
                            </div>
                        </section>

                        <section className="panel history-panel">
                            <div className="panel-header"><div className="title"><History size={16} /> Recent Attempts</div></div>
                            <div className="history-list">
                                {attempts.length > 0 ? attempts.map((a, idx) => (
                                    <div key={idx} className={`history-item ${a.isCorrect ? 'pass' : 'fail'}`}>
                                        <div className="time"><Clock size={12} /> {new Date(a.timestamp).toLocaleTimeString()}</div>
                                        <code className="code-snippet">{a.query.substring(0, 40)}...</code>
                                        <div className="status">{a.isCorrect ? 'SUCCESS' : 'FAILED'}</div>
                                    </div>
                                )) : <div className="empty-hist">No attempts yet.</div>}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AssignmentPage;
