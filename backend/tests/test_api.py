def test_create_request(client):
    response = client.post(
        "/api/requests",
        json={"title": "New request", "description": "Details", "priority": "high"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New request"
    assert data["status"] == "new"
    assert data["priority"] == "high"


def test_list_filter_by_status(client):
    client.post("/api/requests", json={"title": "Open task", "priority": "normal"})
    client.post("/api/requests", json={"title": "Closed task", "priority": "normal"})
    client.patch("/api/requests/2/status", json={"status": "done"})

    response = client.get("/api/requests", params={"status": "new"})

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Open task"


def test_search_by_title(client):
    client.post(
        "/api/requests",
        json={"title": "Billing issue", "description": "invoice", "priority": "low"},
    )
    client.post(
        "/api/requests",
        json={"title": "Other task", "description": "misc", "priority": "low"},
    )

    response = client.get("/api/requests", params={"search": "Billing"})

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Billing issue"


def test_pagination(client):
    for index in range(3):
        client.post(
            "/api/requests",
            json={"title": f"Task {index}", "priority": "normal"},
        )

    response = client.get("/api/requests", params={"page": 1, "page_size": 2})

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["items"]) == 2
    assert data["pages"] == 2


def test_update_status(client):
    client.post("/api/requests", json={"title": "Status task", "priority": "normal"})

    response = client.patch("/api/requests/1/status", json={"status": "in_progress"})

    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"


def test_delete_requires_admin(client):
    client.post("/api/requests", json={"title": "Delete me", "priority": "normal"})

    response = client.delete("/api/requests/1")

    assert response.status_code == 401


def test_done_request_cannot_be_changed_or_deleted(client, admin_headers):
    client.post("/api/requests", json={"title": "Finished task", "priority": "normal"})
    client.patch("/api/requests/1/status", json={"status": "done"})

    patch_response = client.patch("/api/requests/1/status", json={"status": "new"})
    delete_response = client.delete("/api/requests/1", headers=admin_headers)

    assert patch_response.status_code == 400
    assert delete_response.status_code == 400
