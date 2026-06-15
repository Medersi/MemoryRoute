function initFaq() {
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
            questions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.parentElement.classList.remove('active');
                }
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', initFaq);
initFaq();