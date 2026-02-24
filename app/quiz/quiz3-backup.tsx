'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PagerDots from './PagerDots';
import reflectivePng from './images/reflective.png';
// romantic option now uses generic heart icon
import heartPng from '../../images/heart.png';
import adventurePng from './images/adventure.png';
import happinessPng from './images/happiness.png';
import darkPng from './images/dark.png';
import travelPng from './images/travel.png';
import fastPng from './images/fast paced.png';
import sadPng from './images/emotional.png';

export default function Quiz3(): JSX.Element {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();

  const ICON_PNGS: Record<string, any> = {
    reflective: reflectivePng,
    romantic: heartPng,
    adventurous: adventurePng,
    happiness: happinessPng,
    dark: darkPng,
    travel: travelPng,
    fast: fastPng,
    emotional: sadPng,
  };
  
  function onContinue() {
    // Store selections in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizMoods', JSON.stringify(Array.from(selected)));
    }
    
    // Submit all quiz answers to backend
    submitQuizAnswers();
    
    // Navigate to enjoy/completion page
    router.push('/quiz/enjoy');
  }
  
  async function submitQuizAnswers() {
    try {
      // Get all quiz answers from localStorage
      const genres = localStorage.getItem('quizGenres');
      const readingPace = localStorage.getItem('quizReadingPace');
      const moods = localStorage.getItem('quizMoods');
      
      const quizData = {
        genres: genres ? JSON.parse(genres) : [],
        readingPace: readingPace || 'moderate',
        moods: moods ? JSON.parse(moods) : [],
      };
      
      // Update user preferences via API
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await fetch('http://localhost:5000/api/users/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            genres: quizData.genres,
            readingPace: quizData.readingPace,
            mood: quizData.moods,
          })
        });
        
        if (response.ok) {
          console.log('Quiz preferences saved successfully!');
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(242, 240, 228, 1)' }}>
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: `url('/quiz-background.jpg')`, backgroundRepeat: 'repeat', backgroundPosition: 'center', backgroundSize: 'auto', backgroundBlendMode: 'multiply', opacity: 0.13 }} />
      <section className="w-full max-w-6xl px-6 md:px-12 py-12 relative z-10">
        <div className="mx-auto max-w-[980px] text-center">
          {/* Title + subtitle (centered) */}
          <h1 className="text-4xl md:text-5xl font-medium tracking-wide text-[#0C1421] mb-3">What do you like to read?</h1>
          <p className="mx-auto mb-10 max-w-[680px] opacity-90" style={{
            fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '18px',
            lineHeight: '126%',
            letterSpacing: '1%',
            textAlign: 'center',
            verticalAlign: 'middle',
            color: 'rgba(12,20,33,1)'
          }}>Select the genres that interest you. We'll use this to recommend books that match your taste.</p>

          {/* Options: responsive centered grid with selectable cards */}
          <div className="flex justify-center w-full px-2 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 justify-items-center w-full max-w-[1040px]" aria-label="quiz-options" style={{ marginTop: 6 }}>
              {/** Define options and selection state inside the component below (see function body) **/}
              {[
                { id: 'reflective', label: 'Reflective', emoji: '💭' },
                { id: 'romantic', label: 'Romantic' },
                { id: 'adventurous', label: 'Adventurous', emoji: '🧭' },
                { id: 'happiness', label: 'Happiness', emoji: '😊' },
                { id: 'dark', label: 'Dark', emoji: '🌑' },
                { id: 'travel', label: 'Travel', emoji: '✈️' },
                { id: 'fast', label: 'Fast-paced', emoji: '⚡' },
                { id: 'emotional', label: 'Emotional', emoji: '😢' },
              ].map((opt) => {
                // selection state relies on `selected` set defined below
                const isSelected = (selected as Set<string>).has(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      const next = new Set(selected as Set<string>);
                      if (next.has(opt.id)) next.delete(opt.id); else next.add(opt.id);
                      setSelected(next);
                    }}
                    className="rounded-[12px] flex flex-col items-start justify-center gap-3 px-4 sm:px-6 transition-shadow w-full max-w-[244px]"
                    style={{
                      minHeight: 110,
                      height: 'auto',
                      background: isSelected ? '#5C2F1E' : 'rgba(255, 252, 250, 0.51)',
                      border: '1px solid rgba(255, 252, 250, 0.51)',
                      boxShadow: '0px 0px 1px 0px rgba(0, 0, 0, 0.25)',
                      cursor: 'pointer',
                      paddingTop: 16,
                      paddingBottom: 16,
                      paddingLeft: 20,
                    }}
                  >
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? '#FFFFFF' : '#5C2F1E',
                      color: isSelected ? '#5C2F1E' : '#FFFFFF',
                      fontSize: 18,
                    }}>
                      <Image
                        src={ICON_PNGS[opt.id]}
                        alt={opt.label}
                        width={20}
                        height={20}
                        style={{
                          filter: isSelected
                            ? 'invert(22%) sepia(33%) saturate(3000%) hue-rotate(330deg) brightness(95%) contrast(90%)' // brown tint
                            : 'brightness(0) invert(1)', // white tint for unselected
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                      <div style={{
                        fontFamily: "'SF Pro', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '22px',
                        lineHeight: '126%',
                        letterSpacing: '1%',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        color: isSelected ? '#FFFFFF' : 'rgba(0,0,0,1)',
                      }}>{opt.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom controls: Skip | PagerDots (center) | Continue */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 px-4">
            <button 
              onClick={() => router.push('/quiz/quiz2')}
              className="text-sm text-[#0C1421] underline order-3 sm:order-1 hover:text-gray-900"
            >
              Back
            </button>
            <div className="flex-1 flex justify-center order-2">
              <PagerDots />
            </div>
            <button
              onClick={onContinue}
              className="order-1 sm:order-3 w-full sm:w-auto text-white text-center"
              style={{
                maxWidth: 205,
                height: 52,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
                backgroundColor: '#5C2F1E',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
