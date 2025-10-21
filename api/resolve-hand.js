await fetch(`/api/raise-hand`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: modalStudentId })
});
