# SavoMind robot-speaker integration gap

The checked-in mobile contract exposes `/health`, `/chat` (with `/app/chat` fallback),
`/app/voice/turn`, and `/navigation/playback-finished`. None of the represented
request or response models says that a phone-originated reply was queued or played
through `savo_speech`.

The mobile app must not open `/run/savomind/speech.sock`. SavoMind should extend its
existing text and voice turn handlers so that each handler:

1. performs exactly one intelligence/intent turn;
2. generates one canonical `reply_text` and, when allowed, one TTS artifact;
3. sends that same artifact or text to the existing local `savo_speech` transport;
4. returns a documented robot-playback state in the same HTTP response.

The smallest clean extension is a backend-owned option on the existing turn contract
(for example, a documented playback target) plus a documented response object that
reports whether robot playback was requested/queued/failed. The precise field names
must be chosen in the SavoMind backend source and then added to the mobile normalizer;
the app intentionally does not send guessed fields today.

If speech-v2 only supports request/response audio originating from the ReSpeaker, it
must first gain a backend-internal command for unsolicited playback of an already
generated reply. That command belongs between SavoMind and `savo_speech`, not in the
mobile application.
