/**
 * Created by tech on 03.03.2018.
 */
function addEvent(event) {
    //$('#event-modal').modal('show');
    var daysData = {};
    daysData.date_from = event.startDate;
    daysData.date_to = event.endDate;
    daysData.type = event.type;
    daysData.rate = event.rate;
    $.ajax({
        method: 'POST',
        headers: {'X-CSRF-TOKEN': token},
        url: "/admin/calendar/add",
        data: daysData
        //processData: false
    }).done(function(response) {
        console.log(response);
        $(event).css('background-color', 'red');
        $(event).css('color', 'white');
        $(event).css('border-radius', '15px');
    });
}

function editEvent(event) {
    $('#event-modal input[name="event-index"]').val(event ? event.id : '');
    $('#event-modal input[name="event-type"]').val(event ? event.name : '');
    $('#event-modal input[name="event-rate"]').val(event ? event.location : '');
    $('#event-modal input[name="event-start-date"]').val(event.startDate);
    $('#event-modal input[name="event-end-date"]').val(event.endDate);
    $('#event-modal input[name="event-start-date"]').datepicker({dateFormat:'yy-mm-dd'});
    $('#event-modal input[name="event-start-date"]').datepicker('setDate', event.startDate);
    $('#event-modal input[name="event-end-date"]').datepicker({dateFormat:'yy-mm-dd'});
    $('#event-modal input[name="event-end-date"]').datepicker('setDate', event.endDate);
    $('#event-modal').modal();
}

function deleteEvent(event) {
    console.log(event);
    var dataSource = $('#calendar').data('calendar').getDataSource();

    for(var i in dataSource) {
        if(dataSource[i].id == event.id) {
            dataSource.splice(i, 1);
            break;
        }
    }

    $('#calendar').data('calendar').setDataSource(dataSource);
}

function saveEvent() {
    var event2 = {
        id: $('#event-modal input[name="event-index"]').val(),
        type: $('#event-modal select[name="event-type"]').val(),
        rate: $('#event-modal input[name="event-rate"]').val(),
        startDate: $('#event-modal input[name="event-start-date"]').datepicker({dateFormat:'yy-mm-dd'}).val(),
        endDate: $('#event-modal input[name="event-end-date"]').datepicker({dateFormat:'yy-mm-dd'}).val()
    }
    var event = {
        id: $('#event-modal input[name="event-index"]').val(),
        type: $('#event-modal select[name="event-type"]').val(),
        rate: $('#event-modal input[name="event-rate"]').val(),
        color: ($('#event-modal input[name="event-type"]').val() === 'holiday') ? 'red' : 'blue',
        startDate: $('#event-modal input[name="event-start-date"]').datepicker('getDate'),
        endDate: $('#event-modal input[name="event-end-date"]').datepicker('getDate')
    }

    var dataSource = $('#calendar').data('calendar').getDataSource();

    if(event.id) {
        for(var i in dataSource) {
            if(dataSource[i].id == event.id) {
                dataSource[i].type = event.type;
                dataSource[i].rate = event.rate;
                dataSource[i].startDate = new Date((event.startDate).toString());
                dataSource[i].endDate = new Date((event.endDate).toString());
            }
        }
    }
    else
    {
        var newId = 0;
        for(var i in dataSource) {
            if(dataSource[i].id > newId) {
                newId = dataSource[i].id;
            }
        }

        newId++;
        event.id = newId;

        dataSource.push(event);
        console.log(event);
    }

    addEvent(event2);

    $('#calendar').data('calendar').setDataSource(dataSource);
    $('#event-modal').modal('hide');
}

$(function() {
    var currentYear = new Date().getFullYear();

    //var redDateTime = new Date(currentYear, 2, 13).getTime();
    //var circleDateTime = new Date(currentYear, 1, 20).getTime();
    //var borderDateTime = new Date(currentYear, 0, 12).getTime();

    var calendarData = [];

    if (typeof daysOff !== 'undefined' && !!(daysOff)) {
        $(daysOff).each(function (key, value) {
            var event = {
                id: value.id,
                type: value.type,
                color: (value.type === 'holiday') ? 'red' : 'blue',
                rate: (value.type === 'holiday') ? value.rate : null,
                startDate: new Date((value.date_from).toString()),
                endDate: new Date((value.date_to).toString())
            };
            calendarData.push(event);
        });
    }
    console.log(calendarData);

    $('#event-type').on('change', function(){
        /*        if($(this).val() == 'holiday')
         $('#rate-group').show();
         else $('#rate-group').hide();*/
        $('#rate-group').toggle();
    });

    $('#calendar').calendar({
        enableContextMenu: true,
        enableRangeSelection: true,
        contextMenuItems:[
            {
                text: 'Update',
                click: editEvent
            },
            {
                text: 'Delete',
                click: deleteEvent
            }
        ],
        selectRange: function(e) {
            console.log(e);
            editEvent({ id: e.id, type: e.type, rate: e.rate, startDate: e.startDate, endDate: e.endDate });
        },
        mouseOnDay: function(e) {
            //console.log(e.events);
            if(e.events.length > 0) {
                var content = '';

                for(var i in e.events) {
                    content += '<div class="event-tooltip-content">'
                        + '<div class="event-type" style="color:' + e.events[i].color + '">' + e.events[i].type + '</div>'
                        + '<div class="event-rate">' + e.events[i].rate + '</div>'
                        + '</div>';
                }

                $(e.element).popover({
                    trigger: 'manual',
                    container: 'body',
                    html:true,
                    content: content
                });

                $(e.element).popover('show');
            }
        },
        mouseOutDay: function(e) {
            if(e.events.length > 0) {
                $(e.element).popover('hide');
            }
        },
        dayContextMenu: function(e) {
            console.log(e);
            $(e.element).popover('hide');
            $('.calendar-context-menu').css({'left': $(e).offset().left + 25 + 'px', 'top': $(e).offset().top + 25 + 'px'});
        },
        /*        customDayRenderer: function(element, date) {
         if(date.getTime() == redDateTime) {
         $(element).css('font-weight', 'bold');
         $(element).css('font-size', '15px');
         $(element).css('color', 'green');
         }
         else if(date.getTime() == circleDateTime) {
         $(element).css('background-color', 'red');
         $(element).css('color', 'white');
         $(element).css('border-radius', '15px');
         }
         else if(date.getTime() == borderDateTime) {
         $(element).css('border', '2px solid blue');
         }
         },*/
        dataSource: calendarData
    });

    $('#save-event').click(function() {
        saveEvent();
    });

    var $contextMenu = $("#contextMenu");

    $(".day-content").on("contextmenu", function(e) {
        console.log(e.startDate);
        $contextMenu.css({
            display: "block",
            position: "absolute",
            left: $(this).position().left+25+'px',
            top: $(this).position().top
        });
        deleteEvent();
        return false;
    });
});