package main

import "testing"

func TestDeleteOtherSessions(t *testing.T) {
	sessions = []Session{
		{Token: "current", Username: "admin"},
		{Token: "other", Username: "admin"},
		{Token: "someone-else", Username: "listener"},
	}

	deleteOtherSessions("admin", "current")

	if len(sessions) != 2 || sessions[0].Token != "current" || sessions[1].Token != "someone-else" {
		t.Fatalf("unexpected remaining sessions: %#v", sessions)
	}
}
