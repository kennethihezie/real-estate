(function($){

    /**
     * Creates an object that helps to track whether answers have
     * been selected or not.
     *
     * @constructor
     */
    function QuestionAnswers()
    {
        /**
         * List of all the selected answers.
         *
         * @type Object
         */
        this.Answers = {};

        /**
         * Check to see if an answer is already selected.
         *
         * @param AnswerId
         *
         * @returns boolean
         */
        this.IsSelected = function(AnswerId) {
            return (typeof this.Answers[AnswerId] === 'number');
        };

        /**
         * Marks an answer as selected.
         *
         * @param AnswerId
         */
        this.Select = function(AnswerId) {
            this.Answers[AnswerId] = AnswerId;
        };

        /**
         * Removes an answer for the list of selected answers.
         *
         * @param AnswerId
         */
        this.Deselect = function(AnswerId) {
            this.Answers[AnswerId] = null;
        };

        /**
         * Clears all of the answers.
         */
        this.ClearAll = function() {
            this.Answers = [];
        };

        /**
         * Returns the list of selected answers.
         *
         * @return Object
         */
        this.GetAnswers = function() {

            var Answers = [];
            for (var a in this.Answers) {
                if (this.Answers.hasOwnProperty(a) && typeof this.Answers[a] === 'number') {
                    Answers.push(this.Answers[a]);
                }
            }

            return Answers;
        };

        /**
         * Tells whether this question has at least one answer.
         *
         * @returns boolean
         */
        this.HasAnswer = function() {
            return this.GetAnswers().length > 0;
        };

        return this;
    }

    $.fn.Quiz = function(opts) {
        this.options      = $.extend($.fn.Quiz.defaults, opts);
        this.currQuestion = -1;
        this.answers      = [];

        /**
         * Initializes the Quiz by activating the elements.
         *
         * @returns {boolean}
         */
        this.Initialize = function()
        {
            if (this.options.questions.length < 1) {
                console.error("There are no questions for the quiz.");
                return false;
            }

            for (var q = 0; q < this.options.questions.length; q++) {
                for (var a = 0; a < this.options.questions[q].Answers.length; a++) {
                    if (this.options.questions[q].Answers[a].length < 1) {
                        console.error("There are no answers for question #" + (q + 1) + ".");
                        return false;
                    }
                }

                this.answers[q] = new QuestionAnswers();
            }

            var Quiz = this;

            $(this.options.startButton).unbind('click').click(function(){
                Quiz.Start();
            });

            $(this.options.nextButton).unbind('click').click(function() {
                Quiz.Next();
            });

            $(this.options.prevButton + " #prev").unbind('click').click(function() {
                Quiz.Previous();
            });

            $(this.options.pagination + ' .goto').unbind('click').click(function() {
                var QuestionNum = parseInt($(this).prop('data-attr'));
                Quiz.GoTo(QuestionNum);
            });

            $(this.options.emailButton).unbind('click').click(function() {
                var emailUrl = $(this).attr('data-url');
                var userId   = $(this).attr('data-id');
                var field    = $(this).attr('data-fieldname');

                $.ajax({
                    url: emailUrl,
                    data: { Id: userId, EmailField: field },
                    dataType: 'json',
                    success: function(response) { }
                })
            });

            if (typeof this.options.FormSubmitted == 'function') {
                $(document).on('submit.form-plugin', function(event) {
                    return Quiz.options.FormSubmitted.call(Quiz);
                });
            }

            $(this.options.resultsContainer).hide();
            $(this.options.quizContainer).hide();
            $(this.options.introContainer).show();
			
			Quiz.Start();

            return true;
        };

        /**
         * Change the text of the question.
         *
         * @param Question
         */
        this.DrawQuestion = function(Question)
        {
            if (typeof this.options.DrawQuestion == 'function') {
                this.options.DrawQuestion.call(this, Question);

            } else {
                $(this.options.questionContainer).html(Question.Question);
            }
        };

        /**
         * Append the answers to the answer container and then attach any
         * event listeners that are required.
         *
         * @param Question
         */
        this.DrawAnswers = function(Question)
        {
            $(this.options.answersContainer).html('');

            var Answers = this.answers[this.currQuestion];

            if (Question.Type == 'slider') {
                var Labels    = [];
                var AnswerIds = [];

                for (var a = 0; a < Question.Answers.length; a++) {
                    Labels.push(Question.Answers[a].Label);
                    AnswerIds.push(Question.Answers[a].Id);
                }

                // We need to select the first answer.
                Answers.Select(AnswerIds[0]);

                $(this.options.answersContainer).append("<div id='slider_"+ Question.Id+"' class='slider'></div>");
                $('#slider_' + Question.Id).slider({
                    min: 0,
                    max: Labels.length - 1,
                    value: 0

                }).slider('pips', {
                    rest: 'label',
                    labels: Labels

                }).on('slidechange', function(e, ui) {

                    var index = $(this).slider("value");
                    var AnswerId = AnswerIds[index];

                    Answers.Select(AnswerId);
                });

            } else {
                for (var a = 0; a < Question.Answers.length; a++) {
                    var Answer         = Question.Answers[a];
                    var SelectedClass  = this.answers[this.currQuestion].IsSelected(Answer.Id) ? ' active' : '';
                    var Checked        = this.answers[this.currQuestion].IsSelected(Answer.Id) ? 'checked' : '';

                    if (Question.Type == 'radio') {
                        $(this.options.answersContainer).append(
                            "<label class='answer"+ SelectedClass +"' data-attr='"+ Answer.Id +"'><input class='answer-checkbox' id='answer_"+ Answer.Id +"' type='radio' name='answers' value='" + Answer.Id + "' "+ Checked +" /><span>" + Answer.Label + "</span></label>"
                        )
                    } else if (Question.Type == 'checkbox') {
                        $(this.options.answersContainer).append(
                            "<label class='answer"+ SelectedClass +"' data-attr='"+ Answer.Id +"'><input class='answer-checkbox' id='answer_"+ Answer.Id +"' type='checkbox' name='answers[]' value='" + Answer.Id + "' "+ Checked +" /><span>" + Answer.Label + "</span></label>"
                        )
                    }
                }

                var Quiz = this;
                $(this.options.answersContainer + ' .answer').mouseup(function(e) {
                    if (Question.Type === 'radio') {
                        Answers.ClearAll();
                    }

                    var AnswerId = parseInt($(this).attr('data-attr'));

                    if (Answers.IsSelected(AnswerId)) {
                        Answers.Deselect(AnswerId);
                        $(this).removeClass('active');
                    } else {
                        Answers.Select(AnswerId);
                        $(this).addClass('active');
                    }

                    return true;
                });

                $('.answer').find('input').unbind('click').unbind('mousedown');
                $('.answer').find('span').unbind('click').unbind('mousedown');
            }

            if (Question.Type == 'checkbox' || Question.Type == 'slider' || Question.Type == 'fact' || Question.Type == 'radio' ) {
                $(this.options.nextButton).css('display', 'block');
            } else {
                $(this.options.nextButton).css('display', 'none');
            }
        };

        /**
         * Updates the pagination to reflect which question the user is currently on.
         *
         * @constructor
         */
        this.DrawPagination = function()
        {
            if (typeof this.options.DrawPagination == 'function') {
                this.options.DrawPagination.call(this);
            } else {
                $(this.options.pagination + ' .goto').removeClass('active');
                $(this.options.pagination + ' .goto:nth-child('+ (this.currQuestion + 2) +')').addClass('active');
            }
        };

        /**
         * Start the quiz by initializing the first question.
         *
         * @constructor
         */
        this.Start = function()
        {
            if (this.currQuestion < 0) {
                $(this.options.introContainer).hide();
                $(this.options.resultsContainer).hide();
                $(this.options.quizContainer).show();

                this.Next();
            }
        };

        /**
         * Move to the next question.
         *
         * @returns {boolean}
         */
        this.Next = function()
        {
            if (this.currQuestion >= 0) {
                this.SaveAnswer();
            }

            if (this.currQuestion >= 0) {
                var Question = this.options.questions[this.currQuestion];
                if (Question.Type != 'fact') {
                    if (typeof this.answers[this.currQuestion] == 'undefined' || !this.answers[this.currQuestion].HasAnswer()) {

                        var link = document.getElementById('alert');
                        link.style.display = 'table';
                        return true;
                    } else {

                        var link = document.getElementById('alert');
                        link.style.display = 'none';
                    }
                }
            }

            this.currQuestion++;
            if (this.currQuestion > this.options.questions.length - 1) {
                return this.Finish();
            }

            this.TransitionOut(function() {
                var Question = this.options.questions[this.currQuestion];

                this.DrawQuestion(Question);
                this.DrawAnswers(Question);
                this.DrawPagination(Question);
                this.TransitionIn();
            });

            return true;
        };

        /**
         * Move to the previous question.
         *
         * @returns {boolean}
         */
        this.Previous = function()
        {
            this.currQuestion--;
            if (this.currQuestion < 0) {
                return this.Initialize();
            }

            this.TransitionOut(function() {
                var Question = this.options.questions[this.currQuestion];

                this.DrawQuestion(Question);
                this.DrawAnswers(Question);
                this.DrawPagination(Question);
                this.TransitionIn();
            });

            return true;
        };

        /**
         * Move to a specific question
         *
         * @returns {boolean}
         */
        this.GoTo = function(QuestionNum)
        {
            if (QuestionNum > this.options.questions.length - 1) {
                return false;
            }

            if (QuestionNum > 0) {
                if (typeof this.answers[QuestionNum-1] == 'undefined' || !this.answers[QuestionNum-1].HasAnswer()) {
                    return false;
                }
            }

            this.currQuestion = QuestionNum;
            if (this.currQuestion < 0) {
                return this.Initialize();
            }

            this.TransitionOut(function() {
                var Question = this.options.questions[this.currQuestion];

                this.DrawQuestion(Question);
                this.DrawAnswers(Question);
                this.DrawPagination(Question);
                this.TransitionIn();
            });

            return true;
        };

        /**
         * Transitions the content of the quiz out of view.
         *
         * @param callback
         */
        this.TransitionOut = function(callback) {
            if (typeof this.options.TransitionOut == 'function') {
                this.options.TransitionOut.call(this, callback);

            } else {
                if (typeof callback == 'function') {
                    callback.call(this);
                }
            }
        };

        /**
         * Transitions the content of the quiz into view.
         *
         * @param callback
         */
        this.TransitionIn = function(callback) {
            if (typeof this.options.TransitionIn == 'function') {
                this.options.TransitionIn.call(this);

            } else {
                if (typeof callback == 'function') {
                    callback.call(this);
                }
            }
        };

        /**
         * Calculates and returns the final score.
         *
         * @returns {number}
         */
        this.CalculateScore = function()
        {
            var Score     = 0;
            var Questions = this.options.questions;

            if (typeof this.options.CalculateScore == 'function') {
                Score = parseFloat(this.options.CalculateScore.call(this));
            } else {
                for (var q = 0; q < Questions.length; q++) {
                    var Answers = this.answers[q].GetAnswers();
                    for (var Answer in Questions[q].Answers) {
                        for (var a = 0; a < Answers.length; a++) {
                            if (Questions[q].Answers[Answer].Id == Answers[a]) {
                                Score += parseFloat(Questions[q].Answers[Answer].Value);
                            }
                        }
                    }
                }
            }

            return Score;
        };

        /**
         * Finishes the quiz by calculating the score and showing the results.
         *
         * @constructor
         */
        this.Finish = function()
        {
            var Score = this.CalculateScore();

            if (typeof this.options.Finish == 'function') {
                this.options.Finish.call(this);

            } else {
                $(this.options.introContainer).hide();
                $(this.options.quizContainer).hide();
                $(this.options.resultsContainer).show();
            }
        };

        /**
         * Saves the users answer by sending it to the ajax method.
         *
         * @returns {boolean}
         */
        this.SaveAnswer = function()
        {
            if (!this.options.ajax) {
                return false;
            }

            if (this.answers[this.currQuestion]) {
                var Question = this.options.questions[this.currQuestion];
                var Answers  = this.answers[this.currQuestion].GetAnswers();

                $.ajax(this.options.ajax, {
                    method: 'POST',
                    data: {
                        QuestionId: Question.Id,
                        Answers:    Answers
                    }
                });
            }

            return true;
        };

        this.Initialize();

        return this;
    };

    $.fn.Quiz.defaults = {
        questions:          [],
        results:            [],
        ajaxUrl:            null,
        imagePath:          null,
        startButton:        '#start',
        introContainer:     '#intro',
        quizContainer:      '#quiz',
        questionContainer:  '#question',
        answersContainer:   '#answers',
        resultsContainer:   '#results',
        formContainer:      '#contact-form',
        nextButton:         '#next',
        prevButton:         '#prev',
        printButton:        null,
        emailButton:        '#send_email',
        pagination:         '#pagination',
        Initialize:         null,
        DrawQuestion:       null,
        DrawAnswers:        null,
        DrawPagination:     null,
        TransitionIn:       null,
        TransitionOut:      null,
        CalculateScore:     null,
        Finish:             null,
        FormSubmitted:      null
    };
})(jQuery);