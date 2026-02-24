const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// ============================================================
// 1. FIX IMPORTS - add eventsApi, giveawaysApi, authorsApi, reviewsApi
// ============================================================
content = content.replace(
  `import { userApi, recommendationsApi, readingApi, communityApi, bookClubsApi, booksApi } from '../../lib/api';`,
  `import { userApi, recommendationsApi, readingApi, communityApi, bookClubsApi, booksApi, eventsApi, giveawaysApi, authorsApi, reviewsApi } from '../../lib/api';`
);

// ============================================================
// 2. ADD NEW STATE VARIABLES after bookClubs state
// ============================================================
content = content.replace(
  `const [bookClubs, setBookClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);`,
  `const [bookClubs, setBookClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [latestReviews, setLatestReviews] = useState<any[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<number>(0);
  const [readingGoal] = useState<number>(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);`
);

// ============================================================
// 3. UPDATE useEffect - add more API fetches
// ============================================================
content = content.replace(
  `const [userProfile, recommendedBooks, trending, reviewed, currentBooks, feed, clubs]: any[] = await Promise.all([
          userApi.getProfile().catch(() => null),
          recommendationsApi.getPersonalized({ limit: 12 }).catch(() => ({ data: [] })),
          recommendationsApi.getTrending({ limit: 8 }).catch(() => ({ data: [] })),
          booksApi.getAll({ limit: 8 }).catch(() => ({ data: [] })),
          readingApi.getCurrentlyReading().catch(() => ({ data: [] })),
          communityApi.getFeed({ limit: 10 }).catch(() => ({ data: [] })),
          bookClubsApi.getAll().catch(() => ({ data: [] })),
        ]);

        setUserData(userProfile?.data || null);
        setRecommendations(recommendedBooks?.data || []);
        setTrendingBooks(trending?.data || []);
        setMostReviewedBooks(reviewed?.data || []);
        setCurrentReading(currentBooks?.data || []);
        setActivityFeed(feed?.data || []);
        setBookClubs(clubs?.data || []);`,
  `const [userProfile, recommendedBooks, trending, reviewed, currentBooks, feed, clubs, eventsData, giveawaysData, authorsData, finishedData]: any[] = await Promise.all([
          userApi.getProfile().catch(() => null),
          recommendationsApi.getPersonalized({ limit: 12 }).catch(() => ({ data: [] })),
          recommendationsApi.getTrending({ limit: 8 }).catch(() => ({ data: [] })),
          booksApi.getAll({ limit: 8 }).catch(() => ({ data: [] })),
          readingApi.getCurrentlyReading().catch(() => ({ data: [] })),
          communityApi.getFeed({ limit: 10 }).catch(() => ({ data: [] })),
          bookClubsApi.getAll().catch(() => ({ data: [] })),
          eventsApi.getAll({ limit: 4 }).catch(() => ({ data: [] })),
          giveawaysApi.getAll({ limit: 2 }).catch(() => ({ data: [] })),
          authorsApi.getAll({ limit: 6 }).catch(() => ({ data: [] })),
          readingApi.getFinished().catch(() => ({ data: [] })),
        ]);

        setUserData(userProfile?.data || null);
        setRecommendations(recommendedBooks?.data || []);
        setTrendingBooks(trending?.data || []);
        setMostReviewedBooks(reviewed?.data || []);
        setCurrentReading(currentBooks?.data || []);
        setActivityFeed(feed?.data || []);
        setBookClubs(clubs?.data || []);
        setEvents(eventsData?.data || []);
        setGiveaways(giveawaysData?.data || []);
        setAuthors(authorsData?.data || []);
        setFinishedBooks(Array.isArray(finishedData?.data) ? finishedData.data.length : 0);`
);

// ============================================================
// 4. RIGHT PANEL - Expanded title "The Cambers of Secrets" (first occurrence inside expanded panel)
// ============================================================
content = content.replace(
  `>The Cambers of Secrets</h3>
                </div>

                {/* Stars under title (expanded panel only) */}`,
  `>{recommendations[0]?.title || 'Loading...'}</h3>
                </div>

                {/* Stars under title (expanded panel only) */}`
);

// ============================================================
// 5. RIGHT PANEL - ratings text
// ============================================================
content = content.replace(
  `4,113,458 ratings \u2022 99,449 reviews`,
  `{recommendations[0]?.totalRatings?.toLocaleString() || '0'} ratings \u2022 {recommendations[0]?.totalReviews?.toLocaleString() || '0'} reviews`
);

// Fix: the above is inside a JSX text node with curly braces, need to handle the replacement context
// Actually, looking at the code, the text "4,113,458 ratings • 99,449 reviews" is inside a <div> as text content
// Let me check the exact context
// It's: >
//                   4,113,458 ratings • 99,449 reviews
//                 </div>
// So we need to wrap it in {} for JSX

// ============================================================
// 6. RIGHT PANEL - HP description in expanded panel
// ============================================================
content = content.replace(
  `>The summer after his first year at Hogwarts is worse than ever for Harry Potter. The Dursleys of Privet Drive are more horrible to him than ever before...</p>`,
  `>{recommendations[0]?.description?.substring(0, 150) || 'Loading book description...'}...</p>`
);

// ============================================================
// 7. RIGHT PANEL - hardcoded tags array
// ============================================================
content = content.replace(
  `{['adventure', 'Young Adult', 'Fiction', "Children's", 'Medium-paced', 'Mysterious'].map((tag, i) => (`,
  `{[...(recommendations[0]?.genres || []), ...(recommendations[0]?.moodTags || [])].slice(0, 6).map((tag: string, i: number) => (`
);

// ============================================================
// 8. RIGHT PANEL - "Thomas cook" (reader friend name, first occurrence)
// ============================================================
content = content.replace(
  `}}>Thomas cook</div>`,
  `}}>{activityFeed[0]?.user?.name || activityFeed[0]?.user?.username || 'A reader'}</div>`
);

// ============================================================
// 9. RIGHT PANEL - reader quote
// ============================================================
content = content.replace(
  `>"What a delightful and magical chapter it is! It indeed transports readers to the wizarding world"`,
  `>{activityFeed[0]?.content || activityFeed[0]?.text || '"A wonderful reading experience!"'}`
);

// ============================================================
// 10. RIGHT PANEL - "chapter 5 Mystery to solve"
// ============================================================
content = content.replace(
  `}}>chapter 5 Mystery to solve</div>`,
  `}}>{currentReading[0]?.book?.title || 'Currently reading'}</div>`
);

// ============================================================
// 11. RIGHT PANEL - "2 minutes ago"
// ============================================================
content = content.replace(
  `}}>2 minutes ago</div>`,
  `}}>{activityFeed[0]?.createdAt ? new Date(activityFeed[0].createdAt).toLocaleDateString() : 'Just now'}</div>`
);

// ============================================================
// 12. DESKTOP floating title "The Cambers of Secrets" (second occurrence)
// ============================================================
content = content.replace(
  `>The Cambers of Secrets</h3>
          </div>)}

          {/* Author label (desktop only) */}`,
  `>{recommendations[0]?.title || 'Loading...'}</h3>
          </div>)}

          {/* Author label (desktop only) */}`
);

// ============================================================
// 13. DESKTOP "~ JK Rowlings" (first occurrence - inside expanded panel)
// ============================================================
content = content.replace(
  `>~ JK Rowlings</span>
                </div>

                <div aria-hidden style={{
                  position: 'absolute',
                  left: 233.51,`,
  `>~ {recommendations[0]?.author?.name || 'Unknown'}</span>
                </div>

                <div aria-hidden style={{
                  position: 'absolute',
                  left: 233.51,`
);

// ============================================================
// 14. "341 pages • hardcover • first pub 1998"
// ============================================================
content = content.replace(
  `}}>341 pages \u2022 hardcover \u2022 first pub 1998</span>`,
  `}}>{recommendations[0]?.pageCount || '---'} pages \u2022 {recommendations[0]?.format || 'paperback'} \u2022 first pub {recommendations[0]?.publicationDate ? new Date(recommendations[0].publicationDate).getFullYear() : '---'}</span>`
);

// ============================================================
// 15. DESKTOP "~ JK Rowlings" (second occurrence - floating label)
// ============================================================
content = content.replace(
  `>~ JK Rowlings</span>
          </div>)}

          {/* Pages label (desktop only) */}`,
  `>~ {recommendations[0]?.author?.name || 'Unknown'}</span>
          </div>)}

          {/* Pages label (desktop only) */}`
);

// ============================================================
// 16. "154 / 300 Pages"
// ============================================================
content = content.replace(
  `}}>154 / 300 Pages</span>`,
  `}}>{currentReading[0]?.pagesRead || 0} / {currentReading[0]?.book?.pageCount || recommendations[0]?.pageCount || '---'} Pages</span>`
);

// ============================================================
// 17. Desktop book blurb (short HP description)
// ============================================================
content = content.replace(
  `>Harry as he returns to Hogwarts school<br/>of witchcraft and wizardry for his 2nd<br/>year, only to discover that..`,
  `>{recommendations[0]?.description?.substring(0, 100) || 'Loading...'}`
);

// ============================================================
// 18. FEATURED EVENTS - first event title "An Evening with Kazuo Ishiguro..."
// Replace the two hardcoded event panels with a loop
// ============================================================
// First event title
content = content.replace(
  `>An Evening with Kazuo Ishiguro: Memory, Dignity, and the Art of Storytelling</div>

                {/* About Talk button */}
                <button aria-label="About Talk" style={{
                  position: 'absolute',
                  top: 115.42,
                  left: 17.44,
                  width: 111,
                  height: 30,
                  borderRadius: 26843500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '5px 16px',
                  background: '#60351B',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3,
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: 13,
                  lineHeight: '100%'
                }}>About Talk</button>

                {/* Hybrid button */}
                <button aria-label="Hybrid" style={{
                  position: 'absolute',
                  top: 115.42,
                  left: 141.07,
                  width: 79,
                  height: 30,
                  borderRadius: 26843500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '5px 16px',
                  background: '#FFFFFF33',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3,
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: 13,
                  lineHeight: '100%'
                }}>Hybrid</button>
              </div>
            </div>

            {/* Inner featured panel (bottom) */}`,
  `>{events[0]?.title || 'Featured Event Coming Soon'}</div>

                {/* About Talk button */}
                <button aria-label="About Talk" style={{
                  position: 'absolute',
                  top: 115.42,
                  left: 17.44,
                  width: 111,
                  height: 30,
                  borderRadius: 26843500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '5px 16px',
                  background: '#60351B',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3,
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: 13,
                  lineHeight: '100%'
                }}>{events[0]?.type || 'About Talk'}</button>

                {/* Hybrid button */}
                <button aria-label="Hybrid" style={{
                  position: 'absolute',
                  top: 115.42,
                  left: 141.07,
                  width: 79,
                  height: 30,
                  borderRadius: 26843500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '5px 16px',
                  background: '#FFFFFF33',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3,
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: 13,
                  lineHeight: '100%'
                }}>{events[0]?.city || 'Hybrid'}</button>
              </div>
            </div>

            {/* Inner featured panel (bottom) */}`
);

// Second event title (bottom panel)
content = content.replace(
  `>An Evening with Kazuo Ishiguro: Memory, Dignity, and the Art of Storytelling</div>

                {/* About Talk button */}
                <button aria-label="About Talk" style={{
                  position: 'absolute',
                  top: 115.42,
                  left: 17.44,
                  width: 111,
                  height: 30,
                  borderRadius: 26843500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '5px 16px',
                  background: '#60351B',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3,
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: 13,
                  lineHeight: '100%'
                }}>About Talk</button>

                {/* Hybrid button */}
                <button aria-label="Hybrid" style={{
                  position: 'absolute',
                  top: 115.42,
                  left: 141.07,
                  width: 79,
                  height: 30,
                  borderRadius: 26843500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '5px 16px',
                  background: '#FFFFFF33',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3,
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: 13,
                  lineHeight: '100%'
                }}>Hybrid</button>
              </div>
            </div>
          </div>`,
  `>{events[1]?.title || events[0]?.title || 'More Events Coming Soon'}</div>

                {/* About Talk button */}
                <button aria-label="About Talk" style={{
                  position: 'absolute',
                  top: 115.42,
                  left: 17.44,
                  width: 111,
                  height: 30,
                  borderRadius: 26843500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '5px 16px',
                  background: '#60351B',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3,
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: 13,
                  lineHeight: '100%'
                }}>{events[1]?.type || 'About Talk'}</button>

                {/* Hybrid button */}
                <button aria-label="Hybrid" style={{
                  position: 'absolute',
                  top: 115.42,
                  left: 141.07,
                  width: 79,
                  height: 30,
                  borderRadius: 26843500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '5px 16px',
                  background: '#FFFFFF33',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3,
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: 13,
                  lineHeight: '100%'
                }}>{events[1]?.city || 'Hybrid'}</button>
              </div>
            </div>
          </div>`
);

// ============================================================
// 19. GIVEAWAYS - Card 1 title "Literary Fiction Bundle - 5 Modern Classics" (first)
// ============================================================
content = content.replace(
  `}}>Literary Fiction Bundle - 5 Modern Classics</div>

              <div style={{
                width: 394,
                height: 16,
                position: 'absolute',
                top: 210,
                marginLeft: 176,`,
  `}}>{giveaways[0]?.title || 'Giveaway Coming Soon'}</div>

              <div style={{
                width: 394,
                height: 16,
                position: 'absolute',
                top: 210,
                marginLeft: 176,`
);

// Giveaway Card 1 - "Various Authors"
content = content.replace(
  `}}>Various Authors</div>

              {/* calendar icon (first card only) */}`,
  `}}>{giveaways[0]?.book?.author?.name || 'Various Authors'}</div>

              {/* calendar icon (first card only) */}`
);

// Giveaway Card 1 - "Feb 20, 2026"
content = content.replace(
  `}}>Feb 20, 2026</div>`,
  `}}>{giveaways[0]?.endDate ? new Date(giveaways[0].endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</div>`
);

// Giveaway Card 1 - "1,923 entries"
content = content.replace(
  `}}>1,923 entries</div>`,
  `}}>{(giveaways[0]?.entryCount || giveaways[0]?.entries?.length || 0).toLocaleString()} entries</div>`
);

// ============================================================
// 20. GIVEAWAYS - Card 2 title
// ============================================================
content = content.replace(
  `}}>Literary Fiction Bundle - 5 Modern Classics</div>

            <div style={{
              width: 394,
              height: 16,
              position: 'absolute',
              top:82,
              marginLeft: 176,`,
  `}}>{giveaways[1]?.title || giveaways[0]?.title || 'More Giveaways Soon'}</div>

            <div style={{
              width: 394,
              height: 16,
              position: 'absolute',
              top:82,
              marginLeft: 176,`
);

// Giveaway Card 2 - "Various Authors"
content = content.replace(
  `}}>Various Authors</div>

            {/* Inset panel inside Card 2 (per spec) */}`,
  `}}>{giveaways[1]?.book?.author?.name || 'Various Authors'}</div>

            {/* Inset panel inside Card 2 (per spec) */}`
);

// ============================================================
// 21. GIVEAWAY WINNERS - "2 Winners"
// ============================================================
content = content.replace(
  `}}>2 Winners</div>`,
  `}}>{giveaways[1]?.numberOfWinners || giveaways[0]?.numberOfWinners || 0} Winners</div>`
);

// Winner name x2
content = content.replace(
  `}}>Winner name</div>
                </div>

                {/* duplicate — same as original */}`,
  `}}>{giveaways[1]?.winners?.[0]?.user?.name || giveaways[0]?.winners?.[0]?.user?.name || 'Winner TBD'}</div>
                </div>

                {/* duplicate — same as original */}`
);

content = content.replace(
  `}}>Winner name</div>
                </div>
              </div>
            </div>
            </div>`,
  `}}>{giveaways[1]?.winners?.[1]?.user?.name || giveaways[0]?.winners?.[1]?.user?.name || 'Winner TBD'}</div>
                </div>
              </div>
            </div>
            </div>`
);

// "5 Book Bundle" labels (x2)
content = content.replace(
  `}}>5 Book Bundle</div>

            <Image src={trophyIcon} alt="trophy" width={12} height={12} style={{ position: 'absolute', top: 520`,
  `}}>{giveaways[0]?.description?.substring(0, 20) || 'Book Bundle'}</div>

            <Image src={trophyIcon} alt="trophy" width={12} height={12} style={{ position: 'absolute', top: 520`
);

content = content.replace(
  `}}>5 Book Bundle</div>
          </div>

          {/* New panel (desktop only) */}`,
  `}}>{giveaways[1]?.description?.substring(0, 20) || 'Book Bundle'}</div>
          </div>

          {/* New panel (desktop only) */}`
);

// ============================================================
// 22. REVIEW & RATINGS - "How Gourango lost his O"
// ============================================================
content = content.replace(
  `}}>How Gourango lost his O</div>`,
  `}}>{mostReviewedBooks[0]?.title || 'Featured Book'}</div>`
);

// "John wick" author
content = content.replace(
  `}}>John wick</div>`,
  `}}>{mostReviewedBooks[0]?.author?.name || 'Unknown Author'}</div>`
);

// Review description text
content = content.replace(
  `}}>Cassandra lives in a world where you fall in love at first
              sight\u2014or not at all. Too bad she\u2019s blind, and being blind makes her not only immune to love, but also a criminal.
              She must now live alone or face being sentenced to a
              life of slavery...</div>`,
  `}}>{mostReviewedBooks[0]?.description?.substring(0, 200) || 'An incredible story that captivates readers...'}</div>`
);

// ============================================================
// 23. BOOK CLUB - "Navigating Grief Through Literature" (first)
// ============================================================
content = content.replace(
  `}}>Navigating Grief Through Literature</div>
               <button aria-label="Emotional Theme"`,
  `}}>{bookClubs[0]?.name || 'Book Club'}</div>
               <button aria-label="Emotional Theme"`
);

// Book club description (first)
content = content.replace(
  `}}>A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.</div>

              <button aria-label="Join Club" style={{
                position: 'absolute',
                width: 87,
                height: 26,
                top: 113.8,
                left: 395.73,`,
  `}}>{bookClubs[0]?.description || 'Join us for meaningful discussions about great books.'}</div>

              <button aria-label="Join Club" style={{
                position: 'absolute',
                width: 87,
                height: 26,
                top: 113.8,
                left: 395.73,`
);

// "Navigating Grief Through Literature" (second - bottom card)
content = content.replace(
  `}}>Navigating Grief Through Literature</div>

              <button aria-label="Emotional Theme" style={{
                position: 'absolute',
                height:25,
                top: 50.1,
                left: 18.77,
                borderRadius:26843500,
                zIndex: 2,
                background: '#FFE5CF',
                borderTop: '0.8px solid #60351B26',
                fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                fontWeight: 590,
                fontSize: '9px',
                lineHeight: '17px',
                width:100,
                letterSpacing: '-0.6px',
                color: '#210C00',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}><span aria-hidden style={{ fontSize: 14}}>♥</span>Emotional Theme</button>

              <div style={{
                position: 'absolute',
                width: 420.330078125,
                height: 26,
                top: 82.37,
                left: 28.77,
                zIndex: 2,
                opacity: 1,
                fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '9px',
                lineHeight: '13px',
                letterSpacing: '0px',
                color: '#6B4A33',
                display: 'flex',
                alignItems: 'flex-start'
              }}>A compassionate space to explore books that help us understand loss, memory, and healing. We read slowly and discuss deeply.</div>

              <button aria-label="Join Club" style={{
                position: 'absolute',
                width: 87,
                height: 26,
                top: 113.8,
                left: 394.73,`,
  `}}>{bookClubs[1]?.name || bookClubs[0]?.name || 'Book Club'}</div>

              <button aria-label="Emotional Theme" style={{
                position: 'absolute',
                height:25,
                top: 50.1,
                left: 18.77,
                borderRadius:26843500,
                zIndex: 2,
                background: '#FFE5CF',
                borderTop: '0.8px solid #60351B26',
                fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                fontWeight: 590,
                fontSize: '9px',
                lineHeight: '17px',
                width:100,
                letterSpacing: '-0.6px',
                color: '#210C00',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}><span aria-hidden style={{ fontSize: 14}}>\u2665</span>{bookClubs[1]?.tags?.[0] || 'Emotional Theme'}</button>

              <div style={{
                position: 'absolute',
                width: 420.330078125,
                height: 26,
                top: 82.37,
                left: 28.77,
                zIndex: 2,
                opacity: 1,
                fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '9px',
                lineHeight: '13px',
                letterSpacing: '0px',
                color: '#6B4A33',
                display: 'flex',
                alignItems: 'flex-start'
              }}>{bookClubs[1]?.description || bookClubs[0]?.description || 'Join us for meaningful discussions about great books.'}</div>

              <button aria-label="Join Club" style={{
                position: 'absolute',
                width: 87,
                height: 26,
                top: 113.8,
                left: 394.73,`
);

// ============================================================
// 24. AUTHORS SECTION - Replace 6 "Author name" / "Designation" pairs
// Replace the two rows of 3 authors each with mapped arrays
// ============================================================

// First row of 3 authors - Replace with mapped loop
const authorsRow1Start = `{/* author avatars — single row of 3 */}
            <div style={{
              position: 'absolute',
              top: -15,
              left: 24,
              width: 532,
              height: 365,
              display: 'flex',
              gap: 120,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 1
            }}>`;

const authorsRow1Old = content.substring(
  content.indexOf(authorsRow1Start),
  content.indexOf(`</div>
             <div style={{
              position: 'absolute',
              top: 155,
              left: 24,`)
);

if (authorsRow1Old) {
  content = content.replace(authorsRow1Old, `{/* author avatars — single row of 3 */}
            <div style={{
              position: 'absolute',
              top: -15,
              left: 24,
              width: 532,
              height: 365,
              display: 'flex',
              gap: 120,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 1
            }}>
              {authors.slice(0, 3).map((author: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 80, height: 80, borderRadius: 100, overflow: 'hidden', border: '1px solid #210C00' }}>
                  {author.profilePhoto ? (
                    <img src={author.profilePhoto} alt={author.name} width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Image src={user2} alt={author.name || 'author'} width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: '15px',
                  lineHeight: '20px',
                  letterSpacing: '-0.24px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  color: '#210C00'
                }}>{author.name || 'Author'}</div>
                <div style={{
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '20px',
                  letterSpacing: '-0.24px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  color: 'rgba(33, 12, 0, 0.6)'
                }}>{author.totalBooks ? \`\${author.totalBooks} books\` : 'Writer'}</div>
              </div>
              ))}
            `);
}

// Second row of 3 authors
const authorsRow2Start = `<div style={{
              position: 'absolute',
              top: 155,
              left: 24,
              width: 532,
              height: 365,
              display: 'flex',
              gap: 120,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 1
            }}>`;

const authorsRow2StartIdx = content.indexOf(authorsRow2Start);
if (authorsRow2StartIdx !== -1) {
  // Find the closing of this section - it ends at the </div> before the closing of the parent
  const afterRow2 = content.substring(authorsRow2StartIdx);
  // Find the pattern that marks the end of the second authors row
  const endMarker = `</div>
          </div>

          {/* Left floating panel`;
  const endIdx = afterRow2.indexOf(endMarker);
  if (endIdx !== -1) {
    const authorsRow2Old = afterRow2.substring(0, endIdx);
    content = content.replace(authorsRow2Old, `<div style={{
              position: 'absolute',
              top: 155,
              left: 24,
              width: 532,
              height: 365,
              display: 'flex',
              gap: 120,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 1
            }}>
              {authors.slice(3, 6).map((author: any, idx: number) => (
              <div key={idx + 3} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 80, height: 80, borderRadius: 100, overflow: 'hidden', border: '1px solid #210C00' }}>
                  {author.profilePhoto ? (
                    <img src={author.profilePhoto} alt={author.name} width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Image src={user2} alt={author.name || 'author'} width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 510,
                  fontSize: '15px',
                  lineHeight: '20px',
                  letterSpacing: '-0.24px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  color: '#210C00'
                }}>{author.name || 'Author'}</div>
                <div style={{
                  fontFamily: 'SF Pro, "SF Pro Text", "SF Pro Display", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '20px',
                  letterSpacing: '-0.24px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  color: 'rgba(33, 12, 0, 0.6)'
                }}>{author.totalBooks ? \`\${author.totalBooks} books\` : 'Writer'}</div>
              </div>
              ))}
            `);
  }
}

// ============================================================
// 25. READING CHALLENGE - "2" count and "of 12 books completed"
// ============================================================
content = content.replace(
  `}}>2</div>

              {/* completion text next to the number */}`,
  `}}>{finishedBooks}</div>

              {/* completion text next to the number */}`
);

content = content.replace(
  `}}>of 12 books completed</div>`,
  `}}>of {readingGoal} books completed</div>`
);

// Progress bar width
content = content.replace(
  `width: '50%',
                  height: '100%',
                  background: 'rgba(204, 62, 0, 1)',`,
  `width: \`\${readingGoal > 0 ? Math.min((finishedBooks / readingGoal) * 100, 100) : 0}%\`,
                  height: '100%',
                  background: 'rgba(204, 62, 0, 1)',`
);

// ============================================================
// 26. Event cover images - make dynamic
// ============================================================
// First event cover
content = content.replace(
  `<Image src={bookCover2} alt="featured-event" width={496} height={217} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />`,
  `{events[0]?.coverImage ? (
                  <img src={events[0].coverImage} alt={events[0].title || 'event'} width={496} height={217} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <Image src={bookCover2} alt="featured-event" width={496} height={217} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}`
);

// Second event cover
content = content.replace(
  `<Image src={bookCover3} alt="featured-event-2" width={496} height={217} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />`,
  `{events[1]?.coverImage ? (
                  <img src={events[1].coverImage} alt={events[1].title || 'event'} width={496} height={217} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <Image src={bookCover3} alt="featured-event-2" width={496} height={217} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}`
);

// ============================================================
// 27. Giveaway card images - make dynamic
// ============================================================
// First giveaway bundle image
content = content.replace(
  `<Image src={bookBundle1} alt="bundle-1" width={127} height={188} style={{`,
  `{giveaways[0]?.coverImage ? (
                  <img src={giveaways[0].coverImage} alt={giveaways[0].title || 'bundle'} width={127} height={188} style={{
                    position: 'absolute',
                    top: 24.2,
                    left: 7.2,
                    width: 147,
                    height: 198,
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 2,
                    borderBottomRightRadius: 2,
                    borderBottomLeftRadius: 6,
                  }} />
                ) : (
                <Image src={bookBundle1} alt="bundle-1" width={127} height={188} style={{`
);
// Close the ternary for the first bundle
content = content.replace(
  `}} />
                     <button aria-label="Open hours" style={{
              position: 'absolute',
              top: 12,
              left: 83.31,
              width: 63,
              height: 22,
              paddingTop: 3,
              paddingRight: 8,
              paddingBottom: 3,
              paddingLeft: 8,
              gap: 4,
              borderRadius: 9999,
              background: 'rgba(96, 53, 27, 0.6)',
              boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.1), 0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'SF Pro, -apple-system, Arial',
              fontSize: 12,
              cursor: 'pointer',
              zIndex: 60
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 6 }} aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" />
                <path d="M12 7v6l4 2" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>Open</span>
            </button>
              </div>

              <div style={{
                width: 87,
                height: 20,
                position: 'absolute',
                top: 185,`,
  `}} />
                )}
                     <button aria-label="Open hours" style={{
              position: 'absolute',
              top: 12,
              left: 83.31,
              width: 63,
              height: 22,
              paddingTop: 3,
              paddingRight: 8,
              paddingBottom: 3,
              paddingLeft: 8,
              gap: 4,
              borderRadius: 9999,
              background: 'rgba(96, 53, 27, 0.6)',
              boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.1), 0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'SF Pro, -apple-system, Arial',
              fontSize: 12,
              cursor: 'pointer',
              zIndex: 60
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 6 }} aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" />
                <path d="M12 7v6l4 2" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'SF Pro, -apple-system, Arial', fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>{giveaways[0]?.endDate && new Date(giveaways[0].endDate) > new Date() ? 'Open' : 'Closed'}</span>
            </button>
              </div>

              <div style={{
                width: 87,
                height: 20,
                position: 'absolute',
                top: 185,`
);

// "Book Bundle" label for card 1
content = content.replace(
  `}}>Book Bundle</div>

              <div style={{
                width: 379,
                height: 23,
                position: 'relative',
                top: -75.8,`,
  `}}>{giveaways[0]?.book?.title ? 'Book Prize' : 'Book Bundle'}</div>

              <div style={{
                width: 379,
                height: 23,
                position: 'relative',
                top: -75.8,`
);

// ============================================================
// WRITE THE FILE
// ============================================================
fs.writeFileSync(filePath, content, 'utf8');
console.log('Dashboard page updated successfully!');
console.log('File size:', content.length, 'characters');
