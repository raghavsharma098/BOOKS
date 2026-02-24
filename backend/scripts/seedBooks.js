const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Book = require('../models/Book.model');
const Author = require('../models/Author.model');
const User = require('../models/User.model');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SAMPLE_BOOKS = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    isbn: "9780439708180",
    publisher: "Scholastic",
    publishedYear: 1997,
    pages: 309,
    language: "English",
    description: "Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility.",
    genres: ["Fantasy", "Young Adult", "Adventure"],
    moodTags: ["Adventurous", "Inspiring", "Lighthearted"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg"
  },
  {
    title: "The Sun Also Rises",
    author: "Ernest Hemingway",
    isbn: "9780743297332",
    publisher: "Scribner",
    publishedYear: 1926,
    pages: 251,
    language: "English",
    description: "The quintessential novel of the Lost Generation, The Sun Also Rises is one of Ernest Hemingway's masterpieces and a classic example of his spare but powerful writing style.",
    genres: ["Fiction", "Classics", "Literary Fiction"],
    moodTags: ["Reflective", "Dark", "Emotional"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1509802323i/3876.jpg"
  },
  {
    title: "Think Again",
    author: "Adam Grant",
    isbn: "9781984878106",
    publisher: "Viking",
    publishedYear: 2021,
    pages: 320,
    language: "English",
    description: "Intelligence is usually seen as the ability to think and learn, but in a rapidly changing world, there's another set of cognitive skills that might matter more: the ability to rethink and unlearn.",
    genres: ["Non-Fiction", "Psychology", "Self-Help"],
    moodTags: ["Informative", "Inspiring", "Challenging"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602574232i/55539565.jpg"
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    publisher: "Signet Classic",
    publishedYear: 1949,
    pages: 328,
    language: "English",
    description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.",
    genres: ["Fiction", "Dystopian", "Classics"],
    moodTags: ["Dark", "Challenging", "Reflective"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg"
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    publisher: "Scribner",
    publishedYear: 1925,
    pages: 180,
    language: "English",
    description: "The story primarily concerns the young and mysterious millionaire Jay Gatsby and his quixotic passion and obsession to reunite with his ex-lover, the beautiful former debutante Daisy Buchanan.",
    genres: ["Fiction", "Classics", "Romance"],
    moodTags: ["Romantic", "Reflective", "Emotional"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    publisher: "Harper Perennial",
    publishedYear: 1960,
    pages: 324,
    language: "English",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
    genres: ["Fiction", "Classics", "Historical Fiction"],
    moodTags: ["Reflective", "Inspiring", "Emotional"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    publisher: "Penguin Classics",
    publishedYear: 1813,
    pages: 279,
    language: "English",
    description: "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language.",
    genres: ["Fiction", "Romance", "Classics"],
    moodTags: ["Romantic", "Lighthearted", "Hopeful"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg"
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "9780062315007",
    publisher: "HarperOne",
    publishedYear: 1988,
    pages: 208,
    language: "English",
    description: "Paulo Coelho's enchanting novel has inspired a devoted following around the world. This story, dazzling in its powerful simplicity and soul-stirring wisdom, is about an Andalusian shepherd boy named Santiago who travels from his homeland in Spain to the Egyptian desert in search of a treasure buried near the Pyramids.",
    genres: ["Fiction", "Philosophy", "Adventure"],
    moodTags: ["Inspiring", "Reflective", "Adventurous"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg"
  },
  {
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    isbn: "9781594631931",
    publisher: "Riverhead Books",
    publishedYear: 2003,
    pages: 371,
    language: "English",
    description: "The unforgettable, heartbreaking story of the unlikely friendship between a wealthy boy and the son of his father's servant, caught in the tragic sweep of history.",
    genres: ["Fiction", "Historical Fiction", "Drama"],
    moodTags: ["Emotional", "Reflective", "Dark"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579036753i/77203.jpg"
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    publisher: "Harper",
    publishedYear: 2011,
    pages: 443,
    language: "English",
    description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be human.",
    genres: ["Non-Fiction", "History", "Science"],
    moodTags: ["Informative", "Challenging", "Reflective"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1703329310i/23692271.jpg"
  },
  {
    title: "Educated",
    author: "Tara Westover",
    isbn: "9780399590504",
    publisher: "Random House",
    publishedYear: 2018,
    pages: 334,
    language: "English",
    description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    genres: ["Non-Fiction", "Memoir", "Biography"],
    moodTags: ["Inspiring", "Reflective", "Hopeful"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg"
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    isbn: "9780735219090",
    publisher: "G.P. Putnam's Sons",
    publishedYear: 2018,
    pages: 370,
    language: "English",
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl.",
    genres: ["Fiction", "Mystery", "Romance"],
    moodTags: ["Romantic", "Mysterious", "Reflective"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582135294i/36809135.jpg"
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    isbn: "9780525559474",
    publisher: "Viking",
    publishedYear: 2020,
    pages: 304,
    language: "English",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices.",
    genres: ["Fiction", "Fantasy", "Contemporary"],
    moodTags: ["Reflective", "Hopeful", "Inspiring"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    publisher: "Avery",
    publishedYear: 2018,
    pages: 320,
    language: "English",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving - every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    genres: ["Non-Fiction", "Self-Help", "Psychology"],
    moodTags: ["Informative", "Inspiring", "Challenging"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg"
  },
  {
    title: "Little Women",
    author: "Louisa May Alcott",
    isbn: "9780147514011",
    publisher: "Puffin Books",
    publishedYear: 1868,
    pages: 449,
    language: "English",
    description: "Grown-up Meg, tomboyish Jo, timid Beth, and precocious Amy. The four March sisters could not be more different. But with their father away at war, and their mother working to support the family, they have to rely on one another.",
    genres: ["Fiction", "Classics", "Young Adult"],
    moodTags: ["Hopeful", "Lighthearted", "Emotional"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1562690475i/1934.jpg"
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    publisher: "Houghton Mifflin Harcourt",
    publishedYear: 1937,
    pages: 310,
    language: "English",
    description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep one day to whisk him away on an adventure.",
    genres: ["Fantasy", "Adventure", "Fiction"],
    moodTags: ["Adventurous", "Lighthearted", "Inspiring"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg"
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    isbn: "9780060850524",
    publisher: "Harper Perennial",
    publishedYear: 1932,
    pages: 268,
    language: "English",
    description: "Aldous Huxley profoundly important classic of world literature. Brave New World is a searching vision of an unequal, technologically-advanced future where humans are genetically bred, socially indoctrinated, and pharmaceutically anesthetized to passively uphold an authoritarian ruling order.",
    genres: ["Fiction", "Dystopian", "Classics"],
    moodTags: ["Dark", "Challenging", "Reflective"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1575509280i/5129.jpg"
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769174",
    publisher: "Little, Brown and Company",
    publishedYear: 1951,
    pages: 277,
    language: "English",
    description: "The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield. Through circumstances that tend to preclude adult secondhand description, he leaves his prep school in Pennsylvania and goes underground in New York City for three days.",
    genres: ["Fiction", "Classics", "Young Adult"],
    moodTags: ["Reflective", "Dark", "Emotional"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg"
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    isbn: "9780375842207",
    publisher: "Alfred A. Knopf",
    publishedYear: 2005,
    pages: 552,
    language: "English",
    description: "It is 1939. Nazi Germany. The country is holding its breath. Death has never been busier, and will be busier still. By her brother's graveside, Liesel's life is changed when she picks up a single object, partially hidden in the snow. It is The Grave Digger's Handbook, left behind there by accident, and it is her first act of book thievery.",
    genres: ["Fiction", "Historical Fiction", "Young Adult"],
    moodTags: ["Emotional", "Reflective", "Dark"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1522157426i/19063.jpg"
  },
  {
    title: "Normal People",
    author: "Sally Rooney",
    isbn: "9781984822178",
    publisher: "Hogarth",
    publishedYear: 2018,
    pages: 266,
    language: "English",
    description: "At school Connell and Marianne pretend not to know each other. He is popular and well-adjusted, star of the school football team, while she is lonely, proud, and intensely private. But when Connell comes to pick his mother up from her job at Mariannes house, a strange and indelible connection grows between the two teenagers.",
    genres: ["Fiction", "Romance", "Contemporary"],
    moodTags: ["Romantic", "Reflective", "Emotional"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1571423190i/41057294.jpg"
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    isbn: "9781250301697",
    publisher: "Celadon Books",
    publishedYear: 2019,
    pages: 336,
    language: "English",
    description: "Alicia Berenson life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of Londons most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
    genres: ["Fiction", "Mystery", "Thriller"],
    moodTags: ["Mysterious", "Dark", "Challenging"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582759969i/40097951.jpg"
  },
  {
    title: "Circe",
    author: "Madeline Miller",
    isbn: "9780316556347",
    publisher: "Little, Brown and Company",
    publishedYear: 2018,
    pages: 393,
    language: "English",
    description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child - not powerful, like her father, nor viciously alluring like her mother. Turning to the world of mortals for companionship, she discovers that she does possess power - the power of witchcraft.",
    genres: ["Fiction", "Fantasy", "Mythology"],
    moodTags: ["Reflective", "Inspiring", "Adventurous"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1565909496i/35959740.jpg"
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    isbn: "9781524763138",
    publisher: "Crown",
    publishedYear: 2018,
    pages: 448,
    language: "English",
    description: "In a life filled with meaning and accomplishment, Michelle Obama has emerged as one of the most iconic and compelling women of our era. As First Lady of the United States of America, she helped create the most welcoming and inclusive White House in history.",
    genres: ["Non-Fiction", "Memoir", "Biography"],
    moodTags: ["Inspiring", "Hopeful", "Informative"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1528206996i/38746485.jpg"
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    isbn: "9781501161933",
    publisher: "Atria Books",
    publishedYear: 2017,
    pages: 388,
    language: "English",
    description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life. But when she chooses unknown magazine reporter Monique Grant for the job, no one is more astounded than Monique herself.",
    genres: ["Fiction", "Romance", "Historical Fiction"],
    moodTags: ["Romantic", "Emotional", "Reflective"],
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1618661934i/32620332.jpg"
  }
];

async function createAuthor(authorName) {
  try {
    let author = await Author.findOne({ name: authorName });
    
    if (!author) {
      author = await Author.create({
        name: authorName,
        bio: `${authorName} is a renowned author.`,
        birthYear: 1900 + Math.floor(Math.random() * 100),
        nationality: 'Unknown',
      });
      console.log(`✓ Created author: ${authorName}`);
    }
    
    return author._id;
  } catch (error) {
    console.error(`Error creating author ${authorName}:`, error.message);
    return null;
  }
}

async function seedBooks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get or create a system user for createdBy
    let systemUser = await User.findOne({ email: 'system@bookplatform.com' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System',
        email: 'system@bookplatform.com',
        password: 'SystemPassword123!', // Will be hashed automatically
        role: 'admin',
        isEmailVerified: true,
      });
      console.log('✓ Created system user');
    } else {
      console.log('✓ Using existing system user');
    }

    // Clear existing books and authors
    await Book.deleteMany({});
    await Author.deleteMany({});
    console.log('✓ Cleared existing books and authors');

    // Create books with authors
    let successCount = 0;
    let failCount = 0;

    for (const bookData of SAMPLE_BOOKS) {
      try {
        const authorId = await createAuthor(bookData.author);
        
        if (!authorId) {
          failCount++;
          continue;
        }

        const book = await Book.create({
          title: bookData.title,
          author: authorId,
          isbn: bookData.isbn,
          publisher: bookData.publisher,
          publishedYear: bookData.publishedYear,
          pages: bookData.pages,
          language: bookData.language,
          description: bookData.description,
          genres: bookData.genres,
          moodTags: bookData.moodTags,
          coverUrl: bookData.coverUrl,
          averageRating: 3.5 + Math.random() * 1.5, // Random rating between 3.5 and 5
          ratingsCount: Math.floor(Math.random() * 100000) + 1000,
          format: 'Hardcover',
          status: 'approved', // Changed from 'available' to 'approved'
          createdBy: systemUser._id, // Add system user as creator
        });

        console.log(`✓ Created book: ${book.title}`);
        successCount++;
      } catch (error) {
        console.error(`× Failed to create book ${bookData.title}:`, error.message);
        failCount++;
      }
    }

    console.log('\n========================================');
    console.log(`✓ Seeding completed!`);
    console.log(`  - Successfully created: ${successCount} books`);
    console.log(`  - Failed: ${failCount} books`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedBooks();
