document.getElementById('form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const content = document.getElementById('content').value;
    const dueDate = document.getElementById('due_date').value;
    const priority = document.getElementById('priority').value;

    if (content) {
        getAuthToken().then(token => {
            addToGoogleTasks(token, content, dueDate, priority);
        }).catch(error => {
            console.error('Authentication failed', error);
        });
    }
});

function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });
}

function addToGoogleTasks(token, content, dueDate, priority) {
    const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });
    const body = JSON.stringify({
        title: content,
        due: dueDate,
        notes: `Priority: ${priority}`
    });
    fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: headers,
        body: body
    })
    .then(response => response.json())
    .then(data => {
        console.log('Task added:', data);
        alert('Task added successfully!');
    })
    .catch(error => {
        console.error('Error adding task:', error);
    });
}

// After existing code
document.addEventListener('DOMContentLoaded', function() {
    getAuthToken().then(token => {
        fetchTasks(token);
    }).catch(error => {
        console.error('Failed to authenticate', error);
    });
});

function fetchTasks(token) {
    const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'GET',
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        displayTasks(data.items);
    })
    .catch(error => {
        console.error('Error fetching tasks:', error);
    });
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear existing tasks

    if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
            let li = document.createElement('li');
            li.textContent = task.title + (task.due ? ` - Due: ${task.due}` : '');
            taskList.appendChild(li);
        });
    } else {
        taskList.innerHTML = '<li>No tasks found</li>';
    }
}

