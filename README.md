# Skill Exchange

A peer-to-peer skill swapping mobile app for college students. You teach what you know, you learn what you don't, and nobody pays for lessons.

Built with **Expo (React Native)** and JavaScript for the Full Stack Java Programming (FSJP) microproject. It runs on Android and iOS and stores all data on the device, so no server is needed.

## How it works

Every student lists the skills they can **teach** and the skills they want to **learn**, with a **level** for each skill. The app then finds people who fit **both ways**.

Two people are a match only when both of these are true:

1. They can teach something you want to learn, at a level **above yours**.
2. You can teach something they want to learn, at a level **above theirs**.

Levels have numeric values, and the teacher's value must be higher than the learner's:

| Level | Value | Used for |
|---|---|---|
| Never tried | 0 | Learning |
| Beginner | 1 | Teaching and learning |
| Intermediate | 2 | Teaching and learning |
| Expert | 3 | Teaching |

For example, Aarav teaches Java (Expert) and wants Guitar (Never tried). Diya teaches Guitar (Intermediate) and wants Java (Beginner). Both directions work, so they match.

## Features

- **Account:** register and log in, with validation on every field.
- **My Skills:** add and remove skills to teach and to learn, set a level for each, and add from one-tap suggestions.
- **Matches:** ranked by match score, then by rating, with search by name or skill.
- **Requests:** send, accept and decline swap requests, with a badge for pending requests.
- **Sessions:** plan a session by choosing a skill, day and time. Past times are blocked, double booking is blocked, and an optional reminder arrives 15 minutes before.
- **Ratings:** rate your partner from 1 to 5 stars after a completed session, once per session.
- **Reputation:** average rating and badges. Rising Star needs at least 1 rating with an average of 4.0 or more. Trusted Teacher needs at least 3 ratings with an average of 4.5 or more.
- **Profile:** edit your name and bio, see your reputation and reviews, reset the data, and log out.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Expo SDK 57, React Native, JavaScript |
| Navigation | React Navigation (native stack and bottom tabs) |
| Storage | AsyncStorage |
| Reminders | expo-notifications (local notifications) |
| Interface | Ionicons, Poppins font, react-native-safe-area-context |

## Getting started

### Prerequisites

- Node.js (current LTS) and npm
- The **Expo Go** app on your phone, on the same Wi-Fi as your computer

### Install and run

```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
npm install
npx expo start -c
```

Scan the QR code with Expo Go, or press `w` to open the web preview.

## Sample accounts

The app starts with five sample users. All of them use the password **1234**.

| Name | Email | Teaches | Wants to learn |
|---|---|---|---|
| Aarav | aarav@test.com | Java (Expert) | Guitar (Never tried) |
| Diya | diya@test.com | Guitar (Intermediate) | Java (Beginner) |
| Rohan | rohan@test.com | Photoshop (Expert) | Python (Never tried) |
| Sneha | sneha@test.com | Python (Intermediate) | Photoshop (Beginner) |
| Karan | karan@test.com | Guitar (Beginner), Drawing (Intermediate) | Java (Intermediate) |

Expected matches: Aarav matches Diya and Karan, and Rohan and Sneha match each other.

### Try the full flow

1. Log in as Aarav and open **Matches**. Diya and Karan are listed.
2. Tap **Request exchange** on Diya.
3. Log out, log in as Diya, open **Requests** and tap **Accept**.
4. Tap **Plan a session**, choose a skill, a day and a time, and keep the reminder on.
5. Open **Sessions**, tap **Mark as done**, and give a rating.
6. Open Diya's **Profile** to see the average rating and badge.

To see the level rule, log in as Aarav and set Guitar (under I want to learn) to Beginner. Karan disappears from Matches, because a beginner cannot teach another beginner.

## Project structure

```
App.js                      Navigation, fonts and app entry
src/
  api.js                    Data layer, written like a REST API
  AuthContext.js            Current user and pending request count
  constants.js              Skill levels and suggested skills
  theme.js                  Colours, fonts, spacing
  components/               17 reusable components
    AppText, Avatar, BrandMark, Button, Card, EmptyState, Input,
    LoadingView, OptionPills, PlanSessionModal, RatingModal,
    Reputation, Screen, ScreenHeader, SkillChip, StarRating, StatusBadge
  screens/                  7 screens
    LoginScreen, RegisterScreen, SkillsScreen, MatchesScreen,
    RequestsScreen, SessionsScreen, ProfileScreen
  utils/
    dates.js, format.js, matchScore.js,
    reminders.js, reputation.js, validation.js
```

## How the data works

There is no server. `src/api.js` holds a small in-memory database that starts with the sample users and is saved to AsyncStorage after every change, so accounts, requests, sessions and ratings survive restarts.

Screens never read storage directly. They call functions in `api.js`, such as `login`, `getMatches`, `createSession` and `rateSession`. This means a real backend can replace the file later without changing any screen.

To change the sample data, edit the `seed` function at the top of `src/api.js`, then open **Profile** and tap **Reset app data**, because the old data is saved on the phone.

## Notes and troubleshooting

- **Keep the project outside OneDrive** or other synced folders. Syncing `node_modules` can cause strange errors.
- **Stale errors:** run `npx expo start -c` to clear the cache.
- **Reminders:** they are scheduled on the device that plans the session. Expo Go on some Android versions limits notifications, so reminders may not fire there even though the rest of the app works.
- **Logged-in user:** the app remembers who is logged in. To always start at the login screen, remove the saved-session check in `src/AuthContext.js`.

## Limitations

- All data lives on one device, so people on different phones cannot see each other.
- Passwords are stored as plain text in this static version.
- Skill levels are declared by users and are not verified.
- There is no chat.

## Future scope

- A Java Spring Boot REST backend with MongoDB Atlas. Each function in `api.js` maps to an endpoint, for example `getMatches` to `GET /api/users/{id}/matches` and `createSession` to `POST /api/sessions`.
- Password hashing with BCrypt and JWT login.
- Three-way swap chains, availability matching, in-app chat and push notifications.

