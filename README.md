# PasswordGame

Backend for Password game.

Frontend Repo: https://github.com/roerohan/Password

# API

> Note: `?param` implies `param` is optional.
<br/>

> Note: Format: \<REQUEST-TYPE\> \<ROUTE\> - \<PARAMS\>

- All routes return a JSON with the following format:

```typescript
{
    success: boolean,
    message: string | object,
}
```

- `success` indicates if a request passed or failed.
- `message` indicates why a request failed, or stores the response if the operation was successful.

## /room

- `POST /room/create - username, ?access, ?rounds`
    * Create a room with creator as `username`.
    * `access` determines the type of room, may be `private` or `public`.
    * `rounds` implies the number of rounds in the game.
    * Returns the `roomId` and `creator` in the response JSON.
```typescript
{
    success: boolean,
    message: {
        roomId: string,
        creator: string,
        players: [
            {
                username: string,
                points: number,
            },
        ],
    },
}
```

- `GET /room/join/:roomId - username`
    * Add user `username` to the room.
    * Returns a JSON of the following format:
```typescript
{
    success: boolean,
    message: {
        roomId: string,
        creator: string,
        hasStarted: boolean,
        player: {
            username: string,
            points: 0,
        }
        players: [
            {
                username: string,
                points: number,
            },
            {
                username: string,
                points: number,
            },
        ],
    },
}
```

## /game

- `POST /game/start - username, roomId, ?access, ?rounds`
    * `username` must be the creator of the room.
    * Modifies access and rounds according to `access` and `rounds`.
    * Starts the game for room `roomId`.
    * Returns a JSON of the following format:
```typescript
{
    success: boolean,
    message: {
        hasStarted: boolean,
        rounds: number,
        currentRound: number,
        players: [
            {
                username: string,
                points: number,
            },
            {
                username: string,
                points: number,
            },
        ],
    },
}
```

- `POST /game/next - roomId`
    * Generates a new password in the backend for the room, returns the new passwordHolder and the length of the new password.
    * Returns a JSON of the following format:
```typescript
{
    success: boolean,
    message: {
        currentRound: number,
        passwordHolder: string,
        passwordLength: number,
        previousPassword: string,
        players: [
            {
                username: string,
                points: number,
            },
            {
                username: string,
                points: number,
            },
        ],
    },
}
```

- `POST /game/attempt - roomId, username, password`
    * Matches the requested `password` with the current password for the room `roomId`.
    * If they don't match, returns `{ success: true, message: incorrect }`.
    * Otherwise, adds user to list of solvers for the current password and awards the user with points.
    * Returns a JSON of the format:
```typescript
{
    success: boolean,
    message: {
        passwordHolder: string,
        passwordLength: number,
        solvedBy: string[],
        players: [
            {
                username: string,
                points: number,
            },
            {
                username: string,
                points: number,
            },
        ],
    },
}
```

- `POST /game/hint - roomId, username, hint`
    * Adds the hint to the `hints` array for the current round.
    * Returns a JSON of the format:
```typescript
{
    success: boolean,
    message: {
        hints: array,
        passwordHolder: string,
    },
}
``

- `POST /game/end - roomId`
    * Ends the game for `roomId`.
    * Deletes data pertaining to `roomId`.
    * Returns a JSON of the form:

```typescript
{
    success: true,
    message: {
        players: [
            {
                username: string,
                points: number,
            },
            {
                username: string,
                points: number,
            },
        ],
    },
}
```