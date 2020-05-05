# PasswordGame

Backend for Password game.

Frontend Repo: https://github.com/ashikka/Password

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

- `GET /room/join/:roomId - username`
    * Add user `username` to the room.

## /game

- `POST /game/start - username, roomId`
    * `username` must be the creator of the room.
    * Starts the game for room `roomId`.

- `POST /game/next - roomId`
    * Generates a new password in the backend for the room, returns the new passwordHolder and the length of the new password.
    * Returns a JSON of the following format:
```typescript
{
    success: boolean,
    message: {
        passwordHolder: string,
        passwordLength: string,
    }
}
```

- `POST /game/attempt - roomId, username, password`
    * Matches the requested `password` with the current password for the room `roomId`.
    * If they match, adds user to list of solvers for the current password and awards the user with points.
    * Otherwise returns `{ success: true, message: incorrect }`.

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
                points: string,
            },
            {
                username: string,
                points: string,
            },
        ]
    },
}
```