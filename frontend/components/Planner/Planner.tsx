import React, { useState, useRef, useEffect } from 'react';
import styles from './Planner.module.css';

interface PlannerProps {
    boardId: number;
}

export const Planner: React.FC<PlannerProps> = ({ boardId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showMenuDropdown, setShowMenuDropdown] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [plannerWidth, setPlannerWidth] = useState(540);
    const [isResizing, setIsResizing] = useState(false);

    const plannerRef = useRef<HTMLDivElement>(null);
    const resizeStartX = useRef(0);
    const resizeStartWidth = useRef(0);

    // Determine how many days to show based on width
    const getDaysToShow = () => {
        if (plannerWidth >= 900) return 7;
        if (plannerWidth >= 700) return 5;
        if (plannerWidth >= 600) return 3;
        return 1;
    };

    const daysToShow = getDaysToShow();

    // Format date for display
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = selectedDate.getDate();
    const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Get current time for highlighting
    const now = new Date();
    const currentHour = now.getHours();

    // Navigation functions
    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
        setCalendarDate(new Date());
    };

    // Calendar modal functions
    const openCalendarModal = () => {
        setCalendarDate(new Date(selectedDate));
        setShowCalendarModal(true);
    };

    const selectDate = (date: Date) => {
        setSelectedDate(date);
        setShowCalendarModal(false);
    };

    const goToPreviousMonth = () => {
        const newDate = new Date(calendarDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCalendarDate(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(calendarDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCalendarDate(newDate);
    };

    // Resize handle functionality
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeStartX.current = e.clientX;
        resizeStartWidth.current = plannerWidth;
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const delta = e.clientX - resizeStartX.current;
            const newWidth = Math.min(Math.max(resizeStartWidth.current + delta, 400), 1200);
            setPlannerWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, plannerWidth]);

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

        const days: (Date | null)[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevMonthDate = new Date(year, month, -(startingDayOfWeek - i - 1));
            days.push(prevMonthDate);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        const remainingCells = 7 - (days.length % 7);
        if (remainingCells < 7) {
            for (let i = 1; i <= remainingCells; i++) {
                days.push(new Date(year, month + 1, i));
            }
        }

        return days;
    };

    // Generate dates for week view
    const generateWeekDates = () => {
        const dates: Date[] = [];
        const startDate = new Date(selectedDate);

        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push(date);
        }

        return dates;
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isToday = (date: Date) => {
        return isSameDay(date, new Date());
    };

    const isSelected = (date: Date) => {
        return isSameDay(date, selectedDate);
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === calendarDate.getMonth();
    };

    // Generate 24-hour time slots
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return hour;
    });

    const calendarMonthYear = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekDates = generateWeekDates();

    return (
        <div
            ref={plannerRef}
            className={styles.planner}
            style={{ width: `${plannerWidth}px` }}
        >
            <div className={styles.plannerHeader}>
                <button className={styles.dateButton} onClick={openCalendarModal}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                    </svg>
                    <span>{monthYear}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                <button className={styles.navButton} onClick={goToPreviousDay}>‹</button>
                <button className={styles.todayButton} onClick={goToToday}>Today</button>
                <button className={styles.navButton} onClick={goToNextDay}>›</button>
                <div className={styles.menuContainer}>
                    <button
                        className={styles.moreButton}
                        onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                    >
                        ⋯
                    </button>
                    {showMenuDropdown && (
                        <div className={styles.menuDropdown}>
                            <div className={styles.menuHeader}>
                                <span>Menu</span>
                                <button
                                    className={styles.closeMenuButton}
                                    onClick={() => setShowMenuDropdown(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <button className={styles.menuItem}>
                                <span>View connected calendars</span>
                                <span className={styles.menuArrow}>›</span>
                            </button>
                            <button className={styles.menuItem}>
                                <span>Select calendar range</span>
                                <span className={styles.menuArrow}>›</span>
                            </button>
                            <button className={styles.menuItem}>
                                <span>Add account</span>
                                <span className={styles.premiumBadge}>PREMIUM</span>
                                <span className={styles.menuArrow}>›</span>
                            </button>
                            <button className={styles.menuItem}>
                                <span>Disconnect account</span>
                                <span className={styles.menuArrow}>›</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.dayView}>
                {daysToShow === 1 ? (
                    <>
                        <div className={styles.dayHeader}>
                            <span className={styles.dayName}>{dayName}</span>
                            <span className={`${styles.dayNumber} ${isToday(selectedDate) ? styles.currentDay : ''}`}>
                                {dayNumber}
                            </span>
                        </div>

                        <div className={styles.allDaySection}>
                            <span className={styles.allDayLabel}>All day</span>
                        </div>

                        <div className={styles.timeSlots}>
                            {timeSlots.map((hour) => {
                                const hourNum = parseInt(hour);
                                const isCurrentTime = isToday(selectedDate) && hourNum === currentHour;

                                return (
                                    <div key={hour} className={styles.timeSlot}>
                                        <span className={styles.timeLabel}>{hour}</span>
                                        <div className={styles.slotContent}>
                                            {isCurrentTime && (
                                                <div className={styles.currentTimeLine}></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.weekHeader}>
                            {weekDates.map((date, index) => {
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                const dayNum = date.getDate();

                                return (
                                    <div key={index} className={styles.weekDayHeader}>
                                        <span className={styles.weekDayName}>{dayName}</span>
                                        <span className={`${styles.weekDayNumber} ${isToday(date) ? styles.currentDay : ''}`}>
                                            {dayNum}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.weekAllDay}>
                            <span className={styles.allDayLabel}>All day</span>
                            <div className={styles.weekAllDaySlots}>
                                {weekDates.map((_, index) => (
                                    <div key={index} className={styles.weekAllDaySlot}></div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.weekTimeSlots}>
                            {timeSlots.map((hour) => {
                                const hourNum = parseInt(hour);

                                return (
                                    <div key={hour} className={styles.weekTimeRow}>
                                        <span className={styles.timeLabel}>{hour}</span>
                                        <div className={styles.weekTimeColumns}>
                                            {weekDates.map((date, index) => {
                                                const isCurrentTime = isToday(date) && hourNum === currentHour;

                                                return (
                                                    <div key={index} className={styles.weekTimeSlot}>
                                                        {isCurrentTime && (
                                                            <div className={styles.currentTimeLine}></div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Calendar Modal */}
            {showCalendarModal && (
                <div className={styles.calendarModal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <span className={styles.modalTitle}>Select date</span>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowCalendarModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.calendarNavigation}>
                            <button className={styles.navButton} onClick={goToPreviousMonth}>‹</button>
                            <span className={styles.calendarMonthYear}>{calendarMonthYear}</span>
                            <button className={styles.navButton} onClick={goToNextMonth}>›</button>
                        </div>

                        <div className={styles.calendarGrid}>
                            <div className={styles.calendarWeekdays}>
                                {daysOfWeek.map(day => (
                                    <div key={day} className={styles.weekday}>{day}</div>
                                ))}
                            </div>
                            <div className={styles.calendarDays}>
                                {generateCalendarDays().map((date, index) => {
                                    if (!date) return <div key={index} className={styles.emptyDay}></div>;

                                    const dayClasses = [
                                        styles.calendarDay,
                                        !isCurrentMonth(date) ? styles.otherMonth : '',
                                        isToday(date) ? styles.today : '',
                                        isSelected(date) ? styles.selected : ''
                                    ].filter(Boolean).join(' ');

                                    return (
                                        <button
                                            key={index}
                                            className={dayClasses}
                                            onClick={() => selectDate(date)}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resize Handle */}
            <div
                className={styles.resizeHandle}
                onMouseDown={handleResizeMouseDown}
            />
        </div>
    );
};
