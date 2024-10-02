/* Konysbek Dias || onskyD@gmail.com
 ---------------------------------------*/

var lang = $('body').data('lang');
var zoom = $('body').data('zoom');

function validateIins(id, div_id) {
  div_id.find('.field-statementform-childiin' + id).removeClass('has-error');
  div_id.find(' .field-statementform-childiin' + id).children(".help-block").text('');
  if (div_id.find(' #statementform-childiin' + id).val().length < 12) {
    div_id.find('.field-statementform-childiin' + id).addClass('has-error');
    div_id.find('.field-statementform-childiin' + id).children(".help-block").text(Messages['IIN_VALIDATION']);
    return false;
  }
  return true;
}

function checkIIN(iin) {
  let s = 0
  let i

  let iinCut = iin.slice(0, -1)

  for (i = 0; i < iinCut.length; i++) {
    s = s + ((i + 1) * iinCut[i])
  }

  let k = s % (iinCut.length > 11 ? 10 : iinCut.length);

  if (k === (iinCut.length - 1)) {
    s = 0;
    for (i = 0; i < iinCut.length; i++) {
      let t = (i + 3) % iinCut.length;
      if (t === 0) {
        t = iinCut.length;
      }
      s = s + (t * iinCut[i]);
    }

    k = s % iinCut.length;
  }

  //для своих сгенерированных ИИНов
  let res = k.toString() === "10" && iinCut[6] === 9 ? "0" : k.toString();

  return res === iin[iin.length - 1]
}

function hasDuplicates(array) {
  if (array.length < 2) {
    return false;
  }
  var valuesSoFar = Object.create(null);
  for (var i = 0; i < array.length; ++i) {
    var value = array[i];
    if (value in valuesSoFar) {
      return true;
    }
    valuesSoFar[value] = true;
  }
  return false;
}

function viewSelectedFileSize(fileInputId, sizeBlockSelector) {
  fileSize = $('#' + fileInputId)[0].files[0].size;
  console.log(fileSize);
  $(sizeBlockSelector).html(readableBytes(fileSize));
}

function readableBytes(bytes) {
  var i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

function inQueueStudyYearVisibility() {
  if ($('#inStudyYear').is(':visible') || $('#inQueueYear').is(':visible')) {
    $('.inQueueStudyYear').show();
  }
  else {
    $('.inQueueStudyYear').hide();
  }
}

$(document).ready(function () {
  //cabinet validation years
  $('#inStudy').click(function () {
    $('#inStudyYear').toggle();
    inQueueStudyYearVisibility();
  });
  $('#inQueue').click(function () {
    $('#inQueueYear').toggle();
    inQueueStudyYearVisibility();
  });

  //fp select place block window
  $('.fp-select-place').click(function () {
    $(".g-loader-block").addClass('loading');
  });

  // disable buttons on click
  $('.btn-need-disable').click(function () {
    var has_errors = 0;
    var formId = $(this).closest('form').attr('id');
    setTimeout(function () {
      has_errors = $('#' + formId).find('.has-error').length;
      if (has_errors == 0) {
        $('#reservation-form__btn').html('<img src="/images/loading-2.gif" height="20"/>');
        $('.btn-need-disable').attr('disabled', true);
        $('.link-to-disable').addClass('isDisabled');

      }
    }, 500);

  });
  $('.link-to-disable').click(function () {
    $('.btn-need-disable').attr('disabled', true);

    $('.link-to-disable').addClass('isDisabled');


  });
  //Cabinet validation send sms
  $('#cabinet-get-code').click(function () {
    var phoneInput = $('#validationform-phone');
    var phone = phoneInput.val();
    var button = $(this);
    var label = button.html()
    NProgress.start();
    button.attr('disabled', true);
    button.html('<img src="/images/loading-2.gif" height="20" alt="loading"/>')
    phoneInput.attr('readonly', true);
    $.post('/' + lang + '/cabinet/personal/get-phone-code', { phone: phone }, function (data) {
      if (data.IsSuccess) {
        if ('bannedLink' in data) {
          location.href = data.bannedLink;
          return false;
        }
        if (!data.ShowCodeField) {
          button.html(label)
          $('#validation-code-has-no-app').removeClass('d-none');
          $('.base64Code').attr('src', data.qrBase64);
          $('.mobile-app-code').html(data.qrCode);
          button.removeAttr('disabled');
          $('#validationform-phone').attr('readonly', false);
          button.show();
        }
        else {
          button.html(label)
          $('#validation-code-has-no-app').addClass('d-none');
        }
        if (data.ShowCodeField) {
          button.html(label)
          $('#phone-code').show();
          $('.sms-delay').show();
          $('#cabinet-get-code').hide();
        }
        if (data.message) {
          button.html(label)
          Alert.success(data.message);
        }

        //показываем таймер до появления кнопки
        var getSmsDelay = 60000;
        var timerStart = getSmsDelay;
        var timerInterval = 1000;
        var timerId = setInterval(function () {
          timerStart = timerStart - timerInterval;
          $('#currentTime').html(timerStart / 1000);
        }, timerInterval);

        //возвращаем кнопку через 60 секунд
        setTimeout(function () {
          button.html(label)
          clearInterval(timerId);
          button.removeAttr('disabled');
          $('#validationform-phone').attr('readonly', false);
          button.show();
          $('.sms-delay').hide();
        }, getSmsDelay);
      } else {
        button.html(label)
        phoneInput.removeAttr('readonly')
        button.removeAttr('disabled');
        Alert.error(data.message);
      }
    });
    NProgress.done();


  });





  //Cabinet modal
  $('a[data-confirm]').click(function (ev) {
    var confirmButton = 'primary';
    var confirmbuttoncontent = 'OK';
    var currentConfirmButtonClass = $(this).data('confirmbutton');
    var currentCancelButtonClass = $(this).data('cancelbutton');
    var currentConfirmButtonContent = $(this).data('confirmbuttoncontent');
    if (currentConfirmButtonClass) {
      confirmButton = currentConfirmButtonClass;
    }
    if (currentConfirmButtonContent) {
      confirmbuttoncontent = currentConfirmButtonContent;
    }
    var href = $(this).attr('href');
    $('#defaultModal').append('<div class="modal-dialog"><div class="modal-content"><div class="modal-body"></div><div class="modal-footer"><button class="btn btn-' + currentCancelButtonClass + '" data-dismiss="modal" aria-hidden="true">' + Messages['CANCEL'] + '</button><a class="btn btn-' + confirmButton + '" id="dataConfirmOK">' + confirmbuttoncontent + '</a></div></div></div>');
    $('#defaultModal').find('.modal-body').text($(this).attr('data-confirm'));
    $('#dataConfirmOK').attr('href', href);
    $('#defaultModal').modal({ show: true });
    return false;
  });

  // Cabinet queues list

  $('.edit-queues').on('click', function () {
    $('.save-queues, .edit-queues').toggleClass('d-none');
    $('.selected-garden, .list-gardens').toggleClass('d-none');
  });

  // load cancel statement block
  $('.show-cancel-statement').on('click', function () {
    var id = $(this).attr('data-id');
    var div_id = 'cancel_statement_list' + id;
    var button_text = $(this).text();

    $(this).html('<img src="/images/loading-2.gif" height="20"/>');

    if ($('#' + div_id).css('display') == 'none') {
      NProgress.start();
      $('#' + div_id).slideDown();
      $('#show-cancel-request' + id).html('<strong>' + button_text + '</strong> <i class="arrow up"></i>');
      NProgress.done();
      if ($('#benefit_list' + id).css('display') != 'none') {
        $('.show-benefit[data-id=' + id + ']').trigger('click');
      }

    } else {
      $('#' + div_id).slideUp();
      $('#show-cancel-request' + id).html('<strong>' + button_text + '</strong> <i class="arrow down"></i>');
    }
  });

  //load benefits
  $('.show-benefit').on('click', function () {

    var id = $(this).attr('data-id');
    var state = $(this).attr('data-state');
    var div_id = 'benefit_list' + id;
    $(this).html('<img src="/images/loading-2.gif" height="20"/>');

    if ($('#' + div_id).css('display') == 'none') {
      NProgress.start();

      $.post('/' + lang + '/cabinet/statements/load-benefits', { number: id, state: state }, function (data) {
        $('#' + div_id).html(data);
        $('#' + div_id).slideDown();
        if ($('#cancel_statement_list' + id).css('display') != 'none') {
          $('.show-cancel-statement[data-id=' + id + ']').trigger('click');
        }

      })
        .done(function () {
          $('#show-benefit' + id).html('<strong>' + Messages['SHOW_BENEFITS'] + '</strong> <i class="arrow up"></i>');

        });
      NProgress.done();

    } else {

      $('#' + div_id).slideUp();
      $('#show-benefit' + id).html('<strong>' + Messages['SHOW_BENEFITS'] + '</strong> <i class="arrow down"></i>');

    }

  })

  //update benefits
  $(document).on('click', '.update-benefit', function (e) {
    e.preventDefault();
    var id = $(this).attr('data-stid');
    var div_id = '#benefit_list' + id;
    var cancel_id = '#cancel' + id;
    $(this).html('<img src="/images/loading-2.gif" height="20"/>');

    NProgress.start();

    $.post('/' + lang + '/cabinet/statements/load-benefits', { number: id, needGbdUpdate: true }, function (data) {
      $(div_id).html(data);
    })
      .done(function () {
        $('#benefit' + id).html('<strong>' + Messages['UPDATE_BENEFITS'] + '</strong>');

      });


    NProgress.done();

  })
  /// Правка для backdrop модального окна. Проблема плагина с затемнением при подгрузке во внутренний div.
  $(document).on('shown.bs.modal', '.modal', function () {
    $(this).before($('.modal-backdrop'));
  });
  //cancel benefits update
  $(document).on('click', 'span.cancel-benefit', function () {

    var id = $(this).attr('data-stid');
    var div_id = '#benefit_list' + id;
    var state = $('#show-benefit' + id).attr('data-state');

    $(this).html('<img src="/images/loading-2.gif" height="20"/>');

    NProgress.start();

    $.post('/' + lang + '/cabinet/statements/load-benefits', { number: id, state: state }, function (data) {
      $(div_id).html(data);
    })
      .done(function () {
        $('#cancel' + id).html('<strong>' + Messages['CANCEL_BENEFITS'] + '</strong>');

      });

    NProgress.done();

  })
  //save benefits update
  $(document).on('click', 'button.save-benefits', function () {
    $('.save-benefits').html('<img src="/images/loading-2.gif" height="20"/>');
  })

  $(document).on('click', '#update-phones-submit', function () {
    var btn = $('#update-phones-submit')
    var label = btn.html()
    var form = $('#change-phones');
    var formData = form.serialize();
    btn.html('<img src="/images/loading-2.gif" height="20"/>')
    $.post('/' + lang + '/cabinet/settings/change-phones', formData).done(function (response) {
      if (response.status === 'error') {
        Alert.error(response.message)
        btn.html(label)
      }
    })
  })

  $('#change-phones').submit(function (e) {
    e.preventDefault()
  })

  //check iin
  $(document).on('click', 'span.check-iin', function () {

    $('.iins-equal-error').hide();


    var id = $(this).attr('data-stid');
    var ben_id = $(this).attr('data-layerid');
    var div_id = $('#benefit_list' + ben_id);

    var field = 'child' + id;
    let $iinField = div_id.find('#statementform-childiin' + id);
    var iin = div_id.find('#statementform-childiin' + id).val();
    var iins = [];

    for (cid = 1; cid < 5; cid++) {
      if (div_id.find('#statementform-childiin' + cid).val() != '') {
        iins.push(div_id.find(' #statementform-childiin' + cid).val());
      }

    }

    if (hasDuplicates(iins)) {
      div_id.find('.iins-equal-error' + ben_id).show();
    } else {
      div_id.find('.iins-equal-error' + ben_id).hide();

      if (validateIins(id, div_id)) {
        NProgress.start();

        $.post('/' + lang + '/cabinet/statements/check-iin', { field: field, iin: iin }, function (data) {
        })
          .done(function (data) {
            if (data.Status == 1) {
              $iinField.attr('disabled', true);
              div_id.find('#checkiin' + id).hide();
              div_id.find('#iin_error' + id).hide();
              div_id.find('#iin_text' + id).show();
              div_id.find('#checked' + ben_id + '_' + id).val(1);
              div_id.find('#fio' + id).text(data.LastName + ' ' + data.FirstName + ' ' + data.MiddleName);

            } else if (data.Status == 2) {
              div_id.find('#checkiin' + id).hide();
              div_id.find('#iin_error' + id).hide();
              div_id.find('#field' + id).show();
              div_id.find('#statementform-childfile' + id).data('checkupload', 1).attr('data-checkupload', 1);
              div_id.find('#checked' + ben_id + '_' + id).val(1);
              div_id.find('#fio' + id).text(data.LastName + ' ' + data.FirstName + ' ' + data.MiddleName);

            } else {
              div_id.find('#checkiin' + id).show();
              div_id.find('#field' + id).hide();
              div_id.find('#iin_error' + id).show();

              if ('ErrorMessage' in data) {
                Alert.error(data.ErrorMessage);
              }
            }
          });

        NProgress.done();
      }
    }
  });
  $(document).on('click', 'button.clear-form, button.close', function () {
    let $modal = $(this).closest('.modal'),
      $saveFormButton = $modal.find('button.save-form'),
      modalId = $saveFormButton.data('id');

    $('.iins-amount-error' + modalId).hide();
    $('.iins-equal-error' + modalId).hide();
    $('.file-empty-error' + modalId).hide();

    var id;
    for (id = 1; id < 5; id++) {
      $('#checkiin' + id).show();
      $('#statementform-childiin' + id).attr('disabled', false).val('');

      $('#field' + id).hide();
      $('#statementform-childfile' + id).val('');
      $('#iin_text' + id).hide();

      $('#iin_error' + id).hide();
      $('#checked' + id).val(0);
      $('#fio' + id).text('');

      $('.modal-body .input-file').data('checkupload', 0);
    }
  });

  //clear disabled form
  $(document).on('click', 'button.disable_clear-form, button.close', function () {

    $('#disabled_checkiin').show();
    //            $('#statementform-childiin' + id).val('');

    $('#disabled_field').hide();
    $('#statementform-benefitdir9').val('');
    $('#disabled_iin_text').hide();

    $('#disabled_iin_error').hide();
    $('#disabled_checked').val(0);
    $('#disabled_fio').text('');

    $('.file-empty-error').hide();

    $('.modal_disabled .input-file').data('checkupload', 0);

  });

  //save form
  $(document).on('click', 'button.save-form', function () {
    //[TODO] если блокировка будет по иинам, убрать отсюда проверку на дубли

    var ben_id = $(this).attr('data-layerid');
    var div_id = $('#benefit_list' + ben_id);

    div_id.find('.iins-amount-error' + modal_pure_id).hide();
    div_id.find('.iins-equal-error' + modal_pure_id).hide();
    div_id.find('.file-empty-error' + modal_pure_id).hide();


    var id;
    var check = 0;
    var iins = [];
    var modal_id = '#modalIins' + $(this).attr('data-id');
    var modal_pure_id = $(this).attr('data-id');
    for (id = 1; id < 5; id++) {
      if (div_id.find('#checked' + modal_pure_id + '_' + id).val() == 0) {
        check = 1;
        div_id.find('.iins-amount-error' + modal_pure_id).show();

      }
      if (div_id.find('#statementform-childiin' + id).val() != '') {
        iins.push(div_id.find('#statementform-childiin' + id).val());
      }

      if ((div_id.find('#statementform-childfile' + id).data('checkupload') == 1 || div_id.find('#statementform-childfile' + id).attr('data-checkupload') == 1) && $('#statementform-childfile' + id).val() == '') {
        check = 1;
        $('.file-empty-error' + modal_pure_id).show();

      }
    }

    if (hasDuplicates(iins, div_id)) {
      div_id.find('.iins-equal-error' + modal_pure_id).show();
      check = 1;
    }



    if (check != 1) {
      var iin_string = '';
      $.each($(modal_id + ' .bf-child-iin'), function () {
        iin_string += this.value + '<br>';
      });

      div_id.find('.iins-amount-error' + modal_pure_id).hide();
      div_id.find('.iins-equal-error' + modal_pure_id).hide();
      div_id.find('.file-empty-error' + modal_pure_id).hide();
      div_id.find('.update-big-family' + modal_pure_id).html(Messages['CHANGE_BIG_FAMILY']);
      div_id.find('#big-family-text' + modal_pure_id).html(iin_string);
      div_id.find('#modalIins' + modal_pure_id).modal('hide');
    }
  });


  //save disabled form
  $(document).on('click', 'button.disable_save-form', function () {

    var ben_id = $(this).attr('data-layerid');
    var div_id = $('#benefit_list' + ben_id);


    div_id.find('.file-empty-error' + modal_pure_id).hide();


    var check = 0;

    var modal_id = '#modalIins' + $(this).attr('data-id');


    var modal_pure_id = $(this).attr('data-id');



    if ((div_id.find('#statementform-benefitdir9').data('checkupload') == 1 || div_id.find('#statementform-benefitdir9').attr('data-checkupload') == 1) && $('#statementform-benefitdir9').val() == '') {
      check = 1;
      $('.file-empty-error').show();

    }



    if (check != 1) {

      div_id.find('.iins-amount-error' + modal_pure_id).hide();
      div_id.find('.iins-equal-error' + modal_pure_id).hide();
      div_id.find('.file-empty-error' + modal_pure_id).hide();
      div_id.find('.disabled-child-family' + modal_pure_id).html(Messages['CHANGE_BIG_FAMILY']);
      div_id.find('#disabled-child-text' + modal_pure_id).html($('#statementform-disabledchildiin').val());
      div_id.find('#invalid-text' + modal_pure_id).html($('#statementform-disabledchildiin').val());

      div_id.find('#modalDisabled' + modal_pure_id).modal('hide');
    }
  });


  $('.save-queues').on('click', function () {

    $('.save-queues, .edit-queues').toggleClass('d-none');
    var arr_to_send = [];
    $.each($('.select-queue'), function () {

      arr_to_send.push($(this).attr('id') + '-' + $(this).val());

    })

    NProgress.start();

    $.post('/' + lang + '/cabinet/settings/queue-edit', { array: arr_to_send }).done(function (res) {
      if (!res.IsSuccess) {
        Alert.error(res.ErrorMessage);


      } else {
        Alert.success('Данные сохранены успешно');

        $.each($('.select-queue'), function () {
          $('#sg' + $(this).attr('id')).text($('#' + $(this).attr('id') + ' option:selected').text());

        })
        $('.selected-garden, .list-gardens').toggleClass('d-none');

      }
    });
    NProgress.done();


  })
  $(document).on('hidden.bs.modal', '[id ^="modalDisabled"]', function (e) {
    let $sendButton = $(this).find('button.disable_save-form');

    if ($sendButton.length > 0) {
      $sendButton.prop('disabled', true);
    }

  });

  $(document).on('change', '[name="NeedEd24FreePlaceNotifications"]', function () {
    console.log()
  })

  /**
   * Изменение файла в форме добавления квоты
   */
  $(document).on('change', '#disabled_field [type = "file"][name = "StatementForm[benefitDir9]"]', function (e) {
    let $sendButton = $('button.disable_save-form');

    if ($(this).val() !== '') {
      $sendButton.prop('disabled', false);
    } else {
      $sendButton.prop('disabled', true);
    }
  });

  /**
   * Удаление файла из формы добавления квоты
   */
  $(document).on('click', '#disabled_field #js-del-file-statementform-benefitdir9', function (e) {
    $('button.disable_save-form').prop('disabled', true);
  });


  //check iin disabled
  $(document).on('click', 'span.disabled_check-iin', function () {


    var ben_id = $(this).attr('data-layerid');
    var div_id = $('#benefit_list' + ben_id);
    var url = $(this).attr('data-url');
    var field = 'disabledchildiin';
    var invalidIin = div_id.find('#statementform-disabledchildiin').val();
    var childIin = div_id.attr('data-iin');

    //        if (validateIins(id, div_id)) {
    NProgress.start();

    $.post('/' + lang + url, { field: field, invalidIin: invalidIin, childIin: childIin }, function (data) { }).done(function (data) {
      console.log(data);
      let MiddleName = '';

      if (data.hasOwnProperty('MiddleName') && data.MiddleName !== null) {
        MiddleName = data.MiddleName;
      }

      if (data.Status == 1) {
        div_id.find('#disabled_checkiin').hide();
        div_id.find('#disabled_iin_error').hide();
        div_id.find('#disabled_iin_text').show();
        div_id.find('#disabled_checked' + ben_id).val(1);
        div_id.find('#disabled_fio').text(data.LastName + ' ' + data.FirstName + ' ' + MiddleName);
        $('button.disable_save-form').prop('disabled', false);

      } else if (data.Status == 2) {
        div_id.find('#disabled_checkiin').hide();
        div_id.find('#disabled_iin_error').hide();
        div_id.find('#disabled_field').show();
        div_id.find('#statementform-disabledchildfile').data('checkupload', 1).attr('data-checkupload', 1);
        div_id.find('#disabled_checked' + ben_id).val(1);
        div_id.find('#disabled_fio').text(data.LastName + ' ' + data.FirstName + ' ' + MiddleName);
        //$('button.disable_save-form').prop('disabled', false);

      } else {
        Alert.error(data.ErrorMessage);
        /*div_id.find('#disabled_checkiin').show();
        div_id.find('#disabled_field').hide();
        div_id.find('#disabled_iin_error').show();*/
      }
    });

    NProgress.done();
    //        }

  });


  //cabinet settings switch on/off
  $('.apple-switch').on('change', function () {
    var name = $(this).attr('name');
    if (name === 'NeedEd24FreePlaceNotifications') {
      var value = $(this).is(':checked')
      $.post('/' + lang + 'cabinet/settings/change-ed24-notifications', { enabled: value });
      return;
    }

    var child = $(this).data('child');
    var garden = $(this).data('garden');
    var email = $(this).data('email');
    var action = 'false';
    if ($(this).is(':checked')) {
      action = 'true';
    }
    $.post('/' + lang + 'cabinet/settings/switch', { child: child, garden: garden, email: email, action: action });

  });

  // Check if help exist
  if ($("#help").length) {
    $(".btn-header-help").addClass('show');
  }

  // NProgress settings
  NProgress.settings.showSpinner = false;

  /* General functions begin
   ----------------------------------------*/

  if (window.Inputmask !== undefined) {
    $('input[data-mask=tel]').inputmask({ mask: '+7 (999) 999-99-99' });
    $('input[data-mask=code]').inputmask({ mask: '9999' });
    $('input[data-mask=iin]').inputmask({ mask: '999999999999' });
    $('input[data-mask=date]').inputmask({ alias: 'dd.mm.yyyy', placeholder: '__.__.____' });
  }

  $('#login-first-step').on('beforeValidate', function () {
    let iin = $('#profile-IIN').val()
    let field = $('.field-profile-IIN')
    iin = iin.replaceAll('_', '')
    if (iin.length < 12) {
      field.removeClass('has-success').addClass('has-error')
      field.children().last().text(Messages.IIN_VALIDATION)
      return false
    }
    if (!checkIIN(iin)) {
      field.removeClass('has-success').addClass('has-error')
      field.children().last().text(Messages.INCORRECT_IIN)
      return false
    }

    return true
  })

  $('#iin-not-found').on('beforeValidate', function () {
    let iin = $('#childIIN').val()
    let field = $('.field-childIIN')
    iin = iin.replaceAll('_', '')
    if (iin.length < 12) {
      field.removeClass('has-success').addClass('has-error')
      field.children().last().text(Messages.IIN_VALIDATION)
      return false
    }
    if (!checkIIN(iin)) {
      field.removeClass('has-success').addClass('has-error')
      field.children().last().text(Messages.INCORRECT_IIN)
      return false
    }

    return true
  })

  $('a[href*="bitrix-widget"]').click(function (event) {
    event.preventDefault();
    $('div[data-b24-crm-button-block-button]').click();
  });

  $(document).on('pjax:start', function () {
    NProgress.start();
    if ($('#search-word').length > 0) {
      $('html, body').animate({ scrollTop: $('#search-word').offset().top }, 500);
    }


  });
  $(document).on('pjax:end', function () {
    $('.do-filter').removeAttr("disabled");
    $('.btn-block').removeAttr("disabled");

    NProgress.done();
  });

  $(document).on("pjax:start", "#garden-pjax", function () {
    $(".g-loader-block").addClass('loading');
    //$('html, body').animate({scrollTop: $('#search-word-reserv').offset().top}, 500);

  }
  );
  $(document).on("pjax:complete", "#garden-pjax", function () {
    //[TODO]
    var total_pages = parseInt($('#total-pages').val());
    $('#row_count').text($('#hidden_rows').text());
    if (total_pages > gardenList.pageCount) {
      $('#show-more').show();
    } else {
      $('#show-more').hide();
    }
    //free-places проверка и скрытие блока
    if ($('#requestCount')) {
      if ($('#requestCount').val() > 0) {
        $('#gardenType').hide();
      } else {
        $('#gardenType').show();
      }
    }
    //[/TODO]
    if ($('#api-off').val()) {
      $(".g-loader-block").addClass('loading');
    } else {
      $(".g-loader-block").removeClass('loading');
    }
    $('#row_count').text($('#hidden_rows').text());

  }
  );
  /* General functions end
   ----------------------------------------*/


  //disabled links
  $(document).on('click', '.disabled-link', function () {
    Alert.success(Messages['TEMP_DISABLED']);

  });

  /* Filter functions begin
   ----------------------------------------*/

  $(document).on('click', '.filter__checkbox', function () {
    var group = $(this).data('checkbox-group');
    if (group == undefined) {
      $(this).toggleClass('filter__checkbox--active');
    } else {
      $('.filter__checkbox--active[data-checkbox-group=' + group + ']').removeClass('filter__checkbox--active');
      $(this).addClass('filter__checkbox--active');
    }
  });

  // переключение инпутов при клике на таб на free-places
  $(document).on('click', '.free-place-tab', function () {
    var id = $(this).attr('id');
    $('#iin-block, #name-block').hide();
    if (id == 'nav1') {
      $('#iin-block').show();
      $('#search-iin').prop("disabled", false);
      $('#search-word').prop("disabled", true);

    } else if (id == 'nav2') {
      $('#search-iin').prop("disabled", true);
      $('#search-word').prop("disabled", false);
      $('#name-block').show();
    } else {
      $('#search-iin').prop("disabled", false);
      $('#search-word').prop("disabled", false);
      $('#iin-block, #name-block').show();
    }
  });

  $(document).on('click', '.fp-years-item', function (event) {
    event.preventDefault();
    $('.fp-years-item').removeClass('active');
    $(this).addClass('active');
    $('#year-tab').val($(this).data('request'));
  });

  $(document).on('click', '.do-filter, #show-map, #show-table', function () {
    let $closeFilter = $('.close-filter');

    if ($(this).attr('data-type') == 'free-places') {
      $('.do-filter, .btn-block').attr("disabled", true);
      gardenList.searchFreePlaces();
    } else {
      $('.do-filter, .btn-block').attr("disabled", true);
      doFilter();
    }

    if ($closeFilter.length > 0) {
      $closeFilter.trigger('click');
    }
  });
  $('#g-search').on('keyup keypress', function (e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.preventDefault();
      doFilter();
      return false;
    }
  });
  $(document).on('change', ' #gardensearch-perpage', function () {
    gardenList.switchML(1);
  });

  $(document).on('click', '.page-link-gardens', function (e) {
    e.preventDefault();
    var page = $(this).text();
    gardenList.switchML(page);
    return false;

  });
  $(document).on('click', '#resetForm', function () {
    $("#filterForm")[0].reset();
    $('.checked').removeClass('checked');
    gardenList.switchML(0);
  });

  /* Filter functions end
   ----------------------------------------*/

  /* Request functions begin
   ----------------------------------------*/
  $(document).on('click', '#check-iin', function () {
    requestCheck.checkIin();
  });

  $('#g-check-iin').on('keyup keypress', function (e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.preventDefault();
      requestCheck.checkIin();
      return false;
    }
  });
  /* Request functions end
   ----------------------------------------*/

  /* filter functions */
  function doFilter() {
    $('#page-num').val(1);
    if ($('input').is("#search-iin")) {
      var search_iin = $("#search-iin").val();
      search_iin = search_iin.replace('_', '');
      if (search_iin.length < 12 && $('#search-iin').is(':enabled') && $('#search-iin').val()) {
        $("#search-iin").focus();
        $("#search-iin").blur();

      } else {
        gardenList.switchML(1);

      }
    } else {
      if (!$('#do-filter-block').length) {
        gardenList.switchML(1);
      }
    }

  }

  /* Garden list functions begin
   ----------------------------------------*/

  $(document).on('click', '.s-data__filter', function () {
    var input = $(this).find('input');
    input.val((input.val() == '1') ? 0 : 1);
    $('#garden-table').yiiGridView('applyFilter');
  });
  $(document).on('pjax:start', '#garden-list', function (e, r, p) {
    var url = p.requestUrl.replace(p.url, '/' + lang + '/coordinates');
    if (gardenList.type == 'map') {
      gardenList.setCoordinates(url);
    }
  });
  $(document).on('click', '.s-data__item--step', function () {
    $('.s-data__item--step--active').removeClass('s-data__item--step--active');
    $(this).addClass('s-data__item--step--active');
  });
  /* Garden list functions end
   ----------------------------------------*/

  /* Queue list functions begin
   ----------------------------------------*/
  $(document).on('click', '.queue-filter__item', function () {
    $(this).addClass('filter__checkbox--active');
    var input = $(this).find('input');
    $('#search-iscorrectional').val(input.val());
    $('#queue-table').yiiGridView('applyFilter');
  });
  $(document).on('beforeSubmit', '.form-loader', function () {
    Loader.start()
  });
  /* Queue list functions end
   ----------------------------------------*/

  /* Garden detail functions begin
   ----------------------------------------*/

  $('.gn-d__img').click(function () {
    $('.gn-d__preview')
      .removeAttr('src')
      .attr('src', $(this).attr('data-src'));
    $('.gn-d__img--active').removeClass('gn-d__img--active');
    $(this).addClass('gn-d__img--active');
  });
  $(document).on('click', '.gn-d__tabs-title[data-tabs-target]', function () {
    $('.gn-d__tabs-title--active').removeClass('gn-d__tabs-title--active');
    $('.gn-d__tabs-block--active').removeClass('gn-d__tabs-block--active');
    $(this).addClass('gn-d__tabs-title--active');
    $('.gn-d__tabs-block[data-tabs-block=' + $(this).data('tabs-target') + ']')
      .addClass('gn-d__tabs-block--active')
      .find('.animated')
      .removeClass('animated');
  });
  /* Garden detail functions end
   ----------------------------------------*/

  /* Ask functions begin
   ----------------------------------------*/

  /*$('.faq__ask-name:not(.faq__ask-name--empty)').click(function () {
   var answer = $(this).next('.faq__ask-text');
   var link = answer
   .children('*:first-child:last-child');
   if (link[0]){
   window.open(link.attr('href'));
   } else {
   $('.modal-ask .modal-body').html(answer.html());
   app.openModal('.modal-ask');
   }
   });*/

  $('.l-l-collapse-name').click(function () {
    var answer = $(this).next('.l-l-collapse-text');
    var link = answer
      .find('*:first-child:last-child > a:first-child:last-child, a:first-child:last-child');
    if (link[0]) {
      window.open(link.attr('href'));
    } else {
      $(this).toggleClass('l-l-collapse-name--active');
      answer.slideToggle(250);
    }
  });
  /* Ask functions end
   ----------------------------------------*/

  // Lightbox
  $(document).on('click', '#galleryBlock, .gallery-init, *[rel=zoom]', function (event) {
    event = event || window.event;
    if (
      event.target.nodeName == 'IMG' ||
      event.target.nodeName == 'SPAN' ||
      event.target.nodeName == 'A') {
      var target = event.target || event.srcElement;
      var index = (event.target.nodeName == 'A') ? target : target.parentNode;
      var options = {
        index: index,
        event: event
      };
      links = this.getElementsByTagName('a');
      if ($(this).attr('rel') == 'zoom') {
        links = $(this);
      }
      blueimp.Gallery(links, options);
    }
    return false;
  });
  // Modal
  $(document).on('keydown', function (e) {
    if (e.keyCode == 27) {
      app.closeModal();
    }
  });
  $(document).on('click', function (e) {
    var elem = e.target;
    if (elem.attributes['data-modal-close']) {
      app.closeModal();
    }
  });
  // Alert
  $(document).on('click', '.alert__close', function () {
    $(this).parent('.alert').fadeOut(500);
  });

  var loading = false;
  $(document).on('click', '#show-more', function () {

    var total_pages = parseInt($('#total-pages').val());
    var page = parseInt($('#page-num').val()) + 1;

    if (loading == false) {

      loading = true;
      var data_array = {};
      var formdata = $('.filter').serializeArray();
      var lazy_url = '';

      $.each(formdata, function () {
        data_array[this.name] = this.value;
      });
      data_array['Search[searchText]'] = $('#search-word-reserv').val();
      data_array['GardenSearch[name]'] = $('#search-word').val();
      data_array['BulletinSearch[gardenName]'] = $('#search-word').val();

      if ($('#search-word').is(':enabled')) {
        data_array['FreePlacesSearch[name]'] = $('#search-word').val();
      } else {
        data_array['FreePlacesSearch[name]'] = '';
      }
      if ($('#search-iin').is(':enabled')) {
        data_array['FreePlacesSearch[iin]'] = $('#search-iin').val();
      } else {
        data_array['FreePlacesSearch[iin]'] = '';
      }

      //            $('#lazy-loading').css("display", "block");
      $('#show-more').html('<img src="/images/loading-2.gif" height="20"/>');
      if ($('#page-type').val() == 'FREE') {
        lazy_url = "lazy-fp?" + $.param(data_array) + "&page=" + page;
      } else if ($('#page-type').val() == 'LIST') {
        lazy_url = "lazy?" + $.param(data_array) + "&page=" + page;
      } else if ($('#page-type').val() == 'BULL') {
        lazy_url = "lazy-bull?" + $.param(data_array) + "&page=" + page;
      } else if ($('#page-type').val() == 'RESERVE') {
        lazy_url = "lazy-reserve?" + $.param(data_array) + "&page=" + page;
      } else if ($('#page-type').val() == 'EVENT_HISTORY') {
        lazy_url = "lazy-event-history?" + $.param(data_array) + "&page=" + page;
      }


      $.get(lazy_url, function (loaded) {
        //console.log($('#garden-pjax .g-list-view:last .g-list-item:last'));
        $('#garden-pjax .g-list-view:last .g-list-item:last').css({ 'border-bottom': '1px solid #cdcdcd', 'margin-bottom': '0' });
        $('#garden-pjax').append(loaded);
        $('#page-num').val(parseInt($('#page-num').val()) + 1);
        $('#lazy-loading').css("display", "none");
        loading = false;
        if (total_pages <= page) {
          $('#show-more').hide();
        } else {
          $('#show-more').text(Messages['SHOW_MORE']);
        }
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState(null, '', url.toString());
      });
    }
  });

  $(document).on('click', '.show-more-multiple', function () {
    var multiple_button_number = $(this).data('number');
    var container_id = $(this).data('container');
    var params_form = $(this).data('paramsform');
    var request_url = $(this).data('url');

    var total_pages = parseInt($('#total-pages-' + multiple_button_number).val());
    var page = parseInt($('#page-num-' + multiple_button_number).val()) + 1;

    var clicked_button = this;
    if (loading == false) {

      loading = true;
      var data_array = {};
      var formdata = $(params_form).serializeArray();

      $.each(formdata, function () {
        data_array[this.name] = this.value;
      });

      $(this).html('<img src="/images/loading-2.gif" height="20"/>');
      request_url += "?" + $.param(data_array) + "&page=" + page;

      $.get(request_url, function (loaded) {
        $('#' + container_id).append(loaded);
        $('#page-num-' + multiple_button_number).val(parseInt($('#page-num-' + multiple_button_number).val()) + 1);
        $('#lazy-loading-' + multiple_button_number).css("display", "none");
        loading = false;
        if (total_pages <= page) {
          $(clicked_button).hide();
        } else {
          $(clicked_button).text(Messages['SHOW_MORE']);
        }
      });
    }
  });

  // send form
  $(document).on('beforeSubmit', '#reservation-check-form', function () {
    var time = $('#clock-text').text();
    $('#reservationform-reservstartdatetime').val(time);
    var form = $(this);

    NProgress.start();
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize(),
      success: function (res) {
        Alert.error(res.value);
        NProgress.done();
      }
    });
  }
  );

  //выбор года, queue/simple-list
  $(document).on('click', '.select-year', function (event) {
    event.preventDefault();
    $("input[name='Search[year]']").val($(this).data("year"));
    $(".select-year").removeClass("active");
    $(this).addClass("active");
    emulateFilterButton();
  });

  $(document).on('click', '.pjax-href', function (event) {
    event.preventDefault();
    $("input[name='Search[page]']").val($(this).data("page") + 1);
    $(".page-link").removeClass("active");
    $(this).addClass("active");
    emulateFilterButton();
    const page = $(this).data('page') + 1;
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState(null, '', url.toString());
  });

  // кнопка находится внутри формы с атрибутом data-method=post, из-за этого происходит сабмит формы
  $('#restore-link').click(function () {
    let form = $(this).closest('form');
    form.yiiActiveForm('destroy');
  });

  $(document).on('click', '#check-code', function () {
    let button = $('#check-code'),
      container = $('#restore-container'),
      url = button.attr('data-url'),
      scenario = button.attr('data-scenario'),
      params = {},
      loader = $('#modalLoader'),
      block = $('#restore-block'),
      message = $('#error-message')

    if (scenario === 'restore_form_auth') {
      $('#restore-form-auth').yiiActiveForm('validateAttribute', 'secure-key-input')
      let secureKey = $('#secure-key-input').val()

      if (!secureKey) {
        return
      }

      params = {
        'secureKey': secureKey
      }
    }
    block.removeClass('has-error')
    loader.modal('toggle')

    $.post(url, params, function (response) {
      setTimeout(function () {
        loader.modal('toggle')
      }, 1000)
      setTimeout(function () {
        if (response.success) {
          if (response.verified) {
            container.html(response.html)
          } else {
            block.addClass('has-error')
            if (message.length) {
              message.html(response.message)
            } else {
              Alert.error(response.message)
            }
          }
        } else {
          Alert.error(response.message)
        }
      }, 2000)
    })
  })
});


/* App functions begin
 ----------------------------------------*/

app = {
  options: {
    loginFormId: '#login-form'
  },
  videoFrame: $('.modal-video iframe'),
  setLanguage: function (pathName) {
    location.replace(pathName + location.search);
  },
  openModal: function (modal, title) {
    $('body').addClass('modal-active');
    $('.modal-back, .modal-block' + modal + '').addClass('active');
    $('.modal-block' + modal + ' .modal-header span').text(title);
    $('.modal-block').css('z-index', '9999');
  },
  closeModal: function () {
    $('.modal-back, .modal-block.active').removeClass('active');
    $('body').removeClass('modal-active');
    $('#video-iframe').removeAttr('src');
    $('.modal-block').css('z-index', '-1');

  },
  openVideo: function (id) {
    app.openModal('.modal-video');
    $('#video-iframe').attr('src', 'https://www.youtube.com/embed/' + id + '?autoplay=1&loop=1&rel=0');
  },
  sendSmsCode: function (url) {
    var form = $(this.options.loginFormId),
      phone = $('#loginform-phone'),
      phoneId = $('#loginform-phoneid'),
      iin = $('#loginform-iin'),
      button = $('#login-form__send-btn');
    form.yiiActiveForm('validateAttribute', 'loginform-phone');
    form.yiiActiveForm('validateAttribute', 'loginform-iin');
    if (phone.attr('aria-invalid') !== "true" && iin.attr('aria-invalid') !== "true") {
      NProgress.start();
      $.post(url, { phone: phone.val(), iin: iin.val() }).done(function (res) {
        if (res.status) {
          phoneId.val(res.value);
          app.showCountdown(button);
          Alert.success(res.message);
        } else {
          Alert.error(res.message);
        }
      });
      NProgress.done();
    }
  },
  showCountdown: function (button) {
    var oldHtml = button.html();
    var finish = new Date();
    finish.setMinutes(finish.getMinutes() + 2);
    button.countdown(finish, function (event) {
      if (event.type == 'finish') {
        button.prop('disabled', false);
        button.html(oldHtml);
        return false;
      } else {
        button.prop('disabled', true);
      }
      button.text(
        event.strftime('%M:%S')
      );
    });
  },
  cityConfirm: function (url) {
    $('#CityPopover').hide();
    $.get(url, function (res) { });
  }
};
Alert = {
  alert: $('.alert'),
  alertClose: '<span class="icon-close alert__close"></span>',
  success: function (text) {
    this.alert.hide();
    this.alert.removeClass('alert--error').addClass('alert--success');
    this.alert.html(text + this.alertClose);
    this.show();
  },
  error: function (text) {
    this.alert.hide();
    this.alert.removeClass('alert--success').addClass('alert--error');
    this.alert.html(text + this.alertClose);
    this.show();
  },
  show: function () {
    // this.alert.removeClass('alert--hide');
    this.alert.fadeIn('500');
  },
  hide: function () {
    alert.fadeOut('500');
  }
};
gardenList = {
  type: 'table',
  map: null,
  page: 'LIST',
  mapLoaded: false,
  pageCount: 1,
  options: {
    lat: null,
    lng: null,
    copyright: null
  },
  setType: function (type, page) {
    this.type = type;
    this.page = page;

    $(".s-data__table").empty();

    $('.s-data').attr('data-type', type);
    if (type == 'map') {

      $('.filter__btn--table, .icon-map-block').show();
      $('.filter__btn--map').hide();
      $('#mapornot').val(1);

      var mess = 'SCHOOL_' + this.page + '_TYPE_MAP';

      $('.body-title').text(Messages[mess]);
      $('.breadcrumb li:last-child').text(Messages[mess]);
      $(document).attr("title", Messages[mess]);

    } else {

      $('.filter__btn--map').show();
      $('.filter__btn--table, .icon-map-block').hide();
      $('#mapornot').val(0);

      var mess = 'SCHOOL_' + this.page + '_TYPE_TABLE';

      $('.body-title').text(Messages[mess]);
      $('.breadcrumb li:last-child').text(Messages[mess]);
      $(document).attr("title", Messages[mess]);

    }
  },
  loadTable: function (page) {
    this.setType('table', page);

    $('#view-list, .pagination').show();

    $('#mapBlock').hide();

    return false;
  },
  loadMap: function (first_load = 0, page) {

    if (this.map == null) {

      if (!this.mapLoaded && first_load == 1) {
        var data_array = {};
        var formdata = $('.filter').serializeArray();
        $.each(formdata, function () {
          data_array[this.name] = this.value;
        });

        data_array['GardenSearch[name]'] = $('#search-word').val();

        if ($('#search-word').is(':enabled')) {
          data_array['FreePlacesSearch[name]'] = $('#search-word').val();
        } else {
          data_array['FreePlacesSearch[name]'] = '';
        }
        if ($('#search-iin').is(':enabled')) {
          data_array['FreePlacesSearch[iin]'] = $('#search-iin').val();
        } else {
          data_array['FreePlacesSearch[iin]'] = '';
        }
        ymaps.ready(this.mapInit(data_array));
        this.mapLoaded = true;
      }
    }
    this.setType('map', page);

    $('#view-list, .pagination').hide();


    $('#mapBlock').show();
    return false;
  },
  mapInit: function (coords) {

    var o = gardenList;
    var defaultCoordinates = $('#latlng')
    var lat_default = parseFloat(defaultCoordinates.attr('data-lat'));
    var lng_default = parseFloat(defaultCoordinates.attr('data-lng'));
    o.options.lat = lat_default
    o.options.lng = lng_default

    var map = o.map;
    var data;
    if ($('#page-type').val() === 'LIST') {
      url = '/' + lang + '/coordinates?' + $.param(coords);
    } else {
      url = '/' + lang + '/garden/fp-coordinates?' + $.param(coords);
    }
    function getMinMaxLat(data_obj, type) {
      var array = [];
      $.each(data_obj, function (key, item) {
        array[array.length] = item.lat;
      });
      if (type == 'max') {
        return Math.max.apply(Math, array);
      } else {
        return Math.min.apply(Math, array);

      }
    }

    function getMinMaxLng(data_obj, type) {
      var array = [];
      $.each(data_obj, function (key, item) {
        array[array.length] = item.lng;
      });
      if (type == 'max') {
        return Math.max.apply(Math, array);
      } else {
        return Math.min.apply(Math, array);

      }

    }

    $.get(url, function (data) {

    })
      .done(function (data) {

        var row_count = data['countRowsTxt'];
        data = data['result'];

        if (!data) {
          data = [];
        }

        $('#row_count').text(row_count);


        var lat_min = getMinMaxLat(data, 'min');
        var lat_max = getMinMaxLat(data, 'max');
        var lat_mid = (lat_max + lat_min) / 2;
        var lat_delta = (lat_max - lat_min) / 10;

        var lng_min = getMinMaxLng(data, 'min');
        var lng_max = getMinMaxLng(data, 'max');
        var lng_mid = (lng_max + lng_min) / 2;
        var lng_delta = (lng_max - lng_min) / 10;

        if (data.length > 0) {
          var lat_gen = lat_mid;
          var lng_gen = lng_mid;
        } else {
          var lat_gen = o.options.lat;
          var lng_gen = o.options.lng;
        }

        $('.do-filter').removeAttr("disabled");
        $('.btn-block').removeAttr("disabled");

        if (map == null) {

          map = new ymaps.Map("mapBlock", {
            center: [lat_gen, lng_gen],
            zoom: 13,
            type: 'yandex#map',
            controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
          });
        }
        // Map options


        o.map = map;
        o.setCoordinates(data);

        // Copyright
        if (data.length > 0) {
          map.copyrights.add('&copy; ' + o.options.copyright);
          map.setBounds([[lat_min - lat_delta, lng_min - lng_delta], [lat_max + lat_delta, lng_max + lng_delta]], { checkZoomRange: true }).then(function () {

          });
        } else {
          map.setCenter([o.options.lat, o.options.lng], 13, {
            checkZoomRange: false
          });
        }
      })
      .fail(function () {
        if (map == null) {
          map = new ymaps.Map("mapBlock", {
            center: [o.options.lat, o.options.lng],
            zoom: 13,
            type: 'yandex#map',
            controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
          });
        }
        // Map options

        o.map = map;
        o.setCoordinates();
        // Copyright
      });


    return false;
  },
  setCoordinates: function (data) {

    var o = this;
    var map = o.map;
    o.clearCoordinates();
    NProgress.start();


    clusterer = new ymaps.Clusterer({

      preset: 'islands#invertedNightClusterIcons',

      groupByCoordinates: false,

      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
      maxZoom: zoom

    });
    if (data.length > 0) {

      $.each(data, function (key, item) {
        var marker = new ymaps.Placemark([item.lat, item.lng], {
          hintContent: item.name,
          id: item.id
        }, {
          iconLayout: 'default#image',
          iconImageHref: '/images/' + o.getIcon(item),
          iconImageSize: [36, 36]
        });

        if (o.page === 'LIST') {
          var url = '/' + lang + '/marker-info';

        } else {
          var url = '/' + lang + '/fp-marker-info';
        }
        marker.events.add('click', function () {
          $.post(url, { 'id': marker.properties.get('id'), 'iin': $('#search-iin').val() }, function (c) {
            marker.properties.set({
              balloonContent: c
            });
            marker.balloon.open();
          });
        });

        clusterer.add(marker);
      });
      map.geoObjects.add(clusterer);

      NProgress.done();

      return false;

    } else {

      NProgress.done();

    }

    return false;
  },
  clearCoordinates: function () {
    gardenList.map.geoObjects.removeAll();
  },
  searchFreePlaces: function () {
    var data_array = {};
    var formdata = $('.filter').serializeArray();

    $.each(formdata, function () {
      data_array[this.name] = this.value;
    });

    window.history.pushState("", "", '?' + $.param(data_array));

    $.pjax.reload({
      timeout: false,
      container: '#garden-pjax',
      replace: false,
      push: false,
    }).done(function () {

    });
  },
  switchML: function (page = 2) {
    gardenList.pageCount = page;
    $('#show-more').text(Messages['SHOW_MORE']);

    var data_array = {};
    var formdata = $('.filter').serializeArray();

    $.each(formdata, function () {
      data_array[this.name] = this.value;
    });

    if ($('#search-word').is(':enabled')) {
      data_array['FreePlacesSearch[name]'] = $('#search-word').val();
    } else {
      data_array['FreePlacesSearch[name]'] = '';
    }
    if ($('#search-iin').is(':enabled')) {
      data_array['FreePlacesSearch[iin]'] = $('#search-iin').val();
    } else {
      data_array['FreePlacesSearch[iin]'] = '';
    }
    data_array['Search[searchText]'] = $('#search-word-reserv').val();
    data_array['GardenSearch[name]'] = $('#search-word').val();
    data_array['FreePlacesSearch[requestNumber]'] = $('#year-tab').val();
    if ($('#page-type').val() === 'BULL') {
      data_array['BulletinSearch[date]'] = $('#bulletinsearch-date').val();
      data_array['BulletinSearch[gardenName]'] = $('#search-word').val();

    }

    if ($('#page-type').val() === 'RESERVE' || $('#page-type').val() === 'BULL') {
      var map_url = '?';
    } else {
      var map_url = '?map=0&';
    }

    if ($('#mapornot').val() == 1) {

      $('#show-more').hide();
      $('.page-count-selector').hide();
      gardenList.mapInit(data_array);
      window.history.pushState("", "", "?map=1&" + $.param(data_array));

    } else {

      $('.page-count-selector').show();
      window.history.pushState("", "", map_url + $.param(data_array) + '&page=' + page);
      $.pjax.reload({
        timeout: false,
        container: '#garden-pjax',
        replace: false,
        push: false,
      })
        .done(function () {
          var total_pages = parseInt($('#total-pages').val());
          $('#row_count').text($('#hidden_rows').text());
          if (total_pages > page) {
            $('#show-more').show();
          } else {
            $('#show-more').hide();
          }
          //free-places проверка и скрытие блока
          if ($('#requestCount')) {
            if ($('#requestCount').val() > 0) {
              $('#gardenType').hide();
            } else {
              $('#gardenType').show();
            }
          }

        });
    }

  },
  getIcon: function (item) {
    var image_name = '';

    if (item.OwnershipForm === 2) {
      if (item.type == 3) {
        image_name = 'marker-m.svg';
      } else if (item.type == 2) {
        image_name = 'marker-k.svg';
      } else {
        image_name = 'marker.svg';
      }
    } else {
      if (item.type == 3) {
        image_name = 'marker-gos-m.svg';
      } else if (item.type == 2) {
        image_name = 'marker-gos-k.svg';
      } else {
        image_name = 'marker-gos.svg';
      }
    }
    return image_name;

  }
};
gardenDetail = {
  zoomImage: function () {
    blueimp.Gallery($('.gn-d__img'), {
      index: $('.gn-d__img[data-src="' + $('.gn-d__preview').attr('src') + '"]')[0],
      urlProperty: 'full-src'
    });
  }
};
FileInput = {
  beforeUpload: function (e) {
    var parent = $(e).parent();
    var path = $(e).val()
    var fileName = path.match(/[^\/\\]+$/);
    console.log(parent);

    let $fileElem = $(e),
      id = $fileElem.attr('id'),
      $fieldBlock = $('.field-' + id),
      $errorBlock = $fieldBlock.find('.help-block');

    if (e.files) {
      let file = e.files[0],
        validator = $('#file-input-validation'),
        hasError = false

      if (validator) {
        let size = validator.attr('data-size'),
          message = validator.attr('data-message')

        if (file.size > parseInt(size)) {
          hasError = true
          $errorBlock.text(message.replace('{file}', file.name))
          $errorBlock.addClass('text-danger')
        }
      }

      if (!hasError) {
        $errorBlock.empty();

        parent.find('.js-file-select').hide();
        parent.find('.js-btn-edit').text(Messages['EDIT_BUTTON']);
        let editBtn = parent.find('.js-btn-edit')
        if (editBtn.hasClass('w-100')) {
          editBtn.removeClass('w-100').addClass('w-50 mr-1')
        } else {
          editBtn.addClass('d-inline');
        }
        parent.find('.js-del-file').show();

        parent.find('.js-file-upload').text(fileName);
        parent.find('.js-file-upload').removeClass('s-hide');
      }
    }

    console.log($(e).closest(''))
  },
  removeFile: function (e, url) {
    NProgress.start();
    $.get(url, function (res) {
      var parent = $(e).parents('.js-file-section');
      parent.find('input[type=file]').val('');
      parent.find('.js-file-upload').addClass('s-hide').text('');
      parent.find('.js-btn-edit').removeClass('d-inline');
      parent.find('.js-file-select').show();
      let editBtn = parent.find('.js-btn-edit')
      if (editBtn.hasClass('w-50')) {
        editBtn.removeClass('w-50').addClass('w-100 mr-1')
      } else {
        editBtn.addClass('d-inline');
      }

      NProgress.done();
    });
  },
  removeBenefit: function (key, url) {
    if (confirm(Messages['CHECK_EDIT_REMOVE_FILE'])) {
      NProgress.start();
      $.get(url, function (res) {
        var parent = $('.ce-file--' + key);
        parent.find('.ce-file__edit').removeClass('ce-file__edit');
        parent.find('.ce-file__preview').remove();
        NProgress.done();
      });
    }
  },
  removeCorrectionalScan: function (key, url) {
    if (confirm(Messages['CHECK_EDIT_REMOVE_CORRECTIONAL_FILE'])) {
      NProgress.start();
      $.get(url, function (res) {
        var parent = $('.ce-file--' + key);
        parent.find('.ce-file__edit').removeClass('ce-file__edit');
        parent.find('.ce-file__preview').remove();
        NProgress.done();
      });
    }
  }
};

requestCheck = {
  checkIin: function () {
    var iin = $('#checkform-iin').val().replace(/[_\s]/g, '');
    var check_iin = iin.replace(/[_\s]/g, '');
    $("#checkform-iin").focus();
    if (iin != '') { //чекаем на пустоту и соответствие стандарту иин
      NProgress.start();
      $('#checkform-iin, #check-iin').prop('disabled', true);
      $("#list-info").addClass('loading');

      $.ajax({
        url: '/' + lang + '/request/check/' + iin,
        type: 'post',
        data: { iin: iin },
        success: function (res) {
          $('#list-info').html(res);
          $('#checkform-iin, #check-iin').prop('disabled', false);
          window.history.pushState("", "", '/' + lang + '/request/check/');

          NProgress.done();
          $('html, body').animate({ scrollTop: $('#list-info').offset().top }, 500);

        }
      });
    }
  }
};
userRegistration = {

  checkField: function () {
    $('#registration-form').yiiActiveForm('validate', true);
    if ($('.field-recipient-id').hasClass('has-error') || $('.field-recipient-phone').hasClass('has-error')) {
      return false;
    }
    return true;
  },
  formInit: function () {
    $('#blockshow1').addClass('show');
    $('#blockshow2').removeClass('show');
    $('#blockshow3').removeClass('show');
    $('#registration-form')[0].reset();
    $('#enter-form')[0].reset();
    $('#forgot-form')[0].reset();
    $('#recipient-pass-div').hide();
    $('#recipient-pass-div-forgot').hide();

    $('#doReg').hide();
    $('.reg-input').prop('readonly', false);
    $('.reg-input-forgot').prop('readonly', false);
    //        $('#getCode').html('Войти');
    //        $('#getCode-forgot').html('Восстановить');
    //        $('#getCode').prop('disabled', false);
    //        $('#getCode-forgot').prop('disabled', false);


  },
  getCode: function (type) {

    var button = $('#getCode' + type);
    var input_field = $('.reg-input' + type);
    var enter_button = $('#doReg' + type);
    var pass_field = $('#recipient-pass-div' + type);

    button.prop('disabled', true);

    NProgress.start();

    $.post('/' + lang + '/cabinet/get-code', {
      'UserForm[iin]': $('#recipient-id' + type).val(),
      'UserForm[phone]': $('#recipient-phone' + type).val()
    })
      .done(function (c) {
        if (c.IsSuccess) {

          input_field.prop('readonly', true);
          userRegistration.showCountdown(button);
          enter_button.show();
          pass_field.show();

          Alert.success('Код отправлен на указанный номер');
        } else {
          button.prop('disabled', false);
          Alert.error(c.ErrorMessage);
        }
        NProgress.done();
      })

      .fail(function (xhr, textStatus, errorThrown) {
        button.prop('disabled', false);
        Alert.error('Api error');
      });

  },

  showCountdown: function (button) {
    var oldHtml = button.html();
    var finish = new Date();

    finish.setMinutes(finish.getMinutes() + 2);
    button.countdown(finish, function (event) {

      if (event.type == 'finish') {
        button.prop('disabled', false);
        button.html(oldHtml);
        return false;
      } else {
        button.prop('disabled', true);
      }
      button.text(
        event.strftime('%M:%S')
      );
    });
  },
  checkIin: function () {
    $('#w0').yiiActiveForm('validateAttribute', '#consultform-iin');
    return !$('.field-consultform-iin').hasClass('has-error');
  },
  sendHelperSms: function () {

    if (this.checkIin()) {

      var iin = $('#consultform-iin');
      iin.prop('disabled', true);
      $('.btn-sms-code').prop('disabled', true);

      NProgress.start();
      $.post('/' + lang + '/cabinet/personal/send-helper-code', {
        iin: iin.val(),
      }, function (c) {
        if (c.IsSuccess) {
          $('.btn-sms-code').prop('readonly', false);

          $('#consultform-code').prop('disabled', false);

          Alert.success('Смс отправлена успешно');

        } else {
          //                    $('.btn-sms-code').prop('readonly', false);
          $('#consultform-code').prop('disabled', true);

          Alert.error(c.ErrorMessage);

        }
        iin.prop('disabled', false);
        $('.btn-sms-code').prop('disabled', false);


        NProgress.done();
      });
    }
  },

}
/* Inputs end
 ---------------------------------------*/

/* Konysbek Dias || onskyD@gmail.com
 ---------------------------------------*/
Loader = {
  options: {
    id: '.form-loader'
  },
  start: function () {
    $(this.options.id).addClass('loading');
  },
  done: function () {
    $(this.options.id).removeClass('loading')
  }
};

$(document).ready(function () {

  $('.navbar-toggle').click(function () {
    $('#mobileMenu').toggleClass("show");
    $('body').toggleClass("show-menu");
  });
  $("#mobileMenu").swipe({
    swipeLeft: function (event, direction, distance, duration, fingerCount) {
      $('#mobileMenu').removeClass("show");
      $('body').removeClass("show-menu");
    }
  });
  $('.close-menu, .back-filter').click(function () {
    $('#mobileMenu').removeClass("show");
    $('body').removeClass("show-menu");
  });
  $(document).on('click', '.filter-toggle', function () {
    $('#mobileFilter').toggleClass("show");
    $('body').toggleClass("show-menu");
  });
  $('.back-filter, .close-filter').click(function () {
    $('#mobileFilter').removeClass("show");
    $('body').removeClass("show-menu");
  });
  $('.city-select__yes, .city-select__no').click(function () {
    $('#CityPopover').removeClass("show");
  });

  $('.free-places-search-input').keydown(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      return false;
    }
  });
});
$(document).mouseup(function (e) { // отслеживаем событие клика по веб-документу
  var block = $("#mobileMenu"); // определяем элемент, к которому будем применять условия (можем указывать ID, класс либо любой другой идентификатор элемента)
  if (!block.is(e.target) // проверка условия если клик был не по нашему блоку
    && block.has(e.target).length === 0) { // проверка условия если клик не по его дочерним элементам
    $('#mobileMenu').removeClass("show");
    $('body').removeClass("show-menu");
  }
});
$(function () {
  // $(window).on("load", function () {
  //     $("#mobileMenuBody").mCustomScrollbar({
  //         theme: "light-2"
  //     });
  // });
  // $(window).on("load", function () {
  //     $("#mobileFilterBody").mCustomScrollbar({
  //         theme: "dark-2"
  //     });
  // });

  $(".styled, .multiselect-container input").uniform({
    radioClass: 'choice'
  });
});

function emulateFilterButton() {
  $('#filter-button').trigger('click');
}

searchPlaces = {
  data: null,
  templates: null,
  selectedIIn: null,
  setData: function (data) {
    this.data = data;
  },
  setTemplates: function (templates) {
    this.templates = templates;
  },
  searchGetPlaces: function () {
    if (!this.data) {
      $.pjax.reload({
        timeout: false,
        container: '#garden-pjax',
        replace: false,
        push: false,
      }).done(function () {
        searchPlaces.searchByName();
      });
    } else {
      this.searchByName();
    }
  },
  showSearchResults: function () {
    $('.free-places-result-block').html('');
    //        $('.free-places-result-block').append(this.templates.emptyResultBlock);
    $('.g-callout-warning').removeClass('hidden');
    $('.search-empty-result-block').hide();

    console.log(this.data.results);
    if (this.data.results) {
      //            console.log(this.templates);
      var data = this.data;
      var templates = this.templates;
      $.each(data.results, function (key, value) {
        //                console.log(value);
        var templateString = templates.main.replace('%%Id%%', value['i']);
        templateString = templateString.replace('%%Name%%', value['n']);
        templateString = templateString.replace('%%Address%%', value['a']);
        templateString = templateString.replace('%%OwnershipFormName%%', data.ownershipType[value['of']]);
        templateString = templateString.replace('%%IdGardenHash%%', value['hash']);


        // формирование вложенного массива с информацией о местах
        var AgeGroupAxplodedValues = [];
        $.each(value.fp, function (i, v) {
          AgeGroupAxplodedValues.push(v.split('|'));
        });

        var AgeGroupsByID = [];
        $.each(AgeGroupAxplodedValues, function (k, ag) {
          if (typeof AgeGroupsByID[ag[0]] == 'undefined') {
            AgeGroupsByID[ag[0]] = [];
          }
        });

        $.each(AgeGroupAxplodedValues, function (k, ag) {
          if (typeof AgeGroupsByID[ag[0]][ag[1]] == 'undefined') {
            AgeGroupsByID[ag[0]][ag[1]] = [];
          }
        });

        $.each(AgeGroupAxplodedValues, function (k, ag) {
          var temp = 2;
          if (ag[1] == 1) {
            temp = 4;
          }
          if (typeof AgeGroupsByID[ag[0]][ag[1]][ag[temp]] == 'undefined') {
            AgeGroupsByID[ag[0]][ag[1]][ag[temp]] = [];
          }
          if (ag[1] == 0) {
            AgeGroupsByID[ag[0]][ag[1]][ag[temp]].push(ag);
          }
        });


        $.each(AgeGroupAxplodedValues, function (k, ag) {
          if (ag[1] == 1) {
            if (typeof AgeGroupsByID[ag[0]][ag[1]][ag[4]][ag[2]] == 'undefined') {
              AgeGroupsByID[ag[0]][ag[1]][ag[4]][ag[2]] = [];
            }
            AgeGroupsByID[ag[0]][ag[1]][ag[4]][ag[2]].push(ag);
          }
        });

        //                console.log(AgeGroupsByID);

        var allAgeGroupText = '';
        $.each(AgeGroupsByID, function (i, v) {
          var ageGroupText = '';
          if (v) {
            ageGroupText = templates.AgeGroupInfos.replace('', '');
            var GeneralPlaceCount = '';
            var PriorityPlaceCount = '';
            //                        console.log(v);
            //разбор массива, где agi = 0 - массив обычных мест, 1 - приоритетных
            $.each(v, function (agi, agv) {
              if (agv) {
                if (agi == 0) {
                  var generalByStudyLanguage = '';
                  var PlacesFullCount = 0;
                  $.each(agv, function (lni, lnv) {
                    var emptyPlaceByLanguageCount = 0;
                    if (lnv) {
                      var emptyPlace0 = templates.ByStudyLanguageEmptyPlaces.replace('%%ItemName%%', data.languages[lni]);
                      $.each(lnv, function (lnSti, lnStv) {
                        emptyPlaceByLanguageCount = emptyPlaceByLanguageCount + parseInt(lnStv[3]);
                      });

                      emptyPlace0 = emptyPlace0.replace('%%Count%%', emptyPlaceByLanguageCount);
                      generalByStudyLanguage = generalByStudyLanguage + emptyPlace0;
                    }

                    PlacesFullCount = PlacesFullCount + emptyPlaceByLanguageCount;
                  });

                  GeneralPlaceCount = GeneralPlaceCount + templates.GeneralPlaceCount.replace('%%FreePlaceCount%%', PlacesFullCount);
                  GeneralPlaceCount = GeneralPlaceCount.replace('%%ByStudyLanguageEmptyPlaces%%', generalByStudyLanguage);
                }

                if (agi == 1) {
                  for (var key in agv) {
                    var priorityByStudyLanguage = '';
                    var PlacesFullCount = 0;

                    $.each(agv[key], function (lni, lnv) {
                      var emptyPlaceByLanguageCount = 0;

                      if (lnv) {
                        var lang = '';
                        $.each(lnv, function (lnSti, lnStv) {
                          emptyPlaceByLanguageCount = emptyPlaceByLanguageCount + parseInt(lnStv[3]);
                          lang = lnStv[2];
                        });
                        var emptyPlace = templates.ByStudyLanguageEmptyPlaces.replace('%%ItemName%%', data.languages[lang]);

                        emptyPlace = emptyPlace.replace('%%Count%%', emptyPlaceByLanguageCount);

                        priorityByStudyLanguage = priorityByStudyLanguage + emptyPlace;

                      }

                      PlacesFullCount = PlacesFullCount + emptyPlaceByLanguageCount;
                    });
                    PriorityPlaceCount = PriorityPlaceCount + templates.PriorityPlaceCount.replace('%%PriorityPlaceCount%%', PlacesFullCount);
                    PriorityPlaceCount = PriorityPlaceCount.replace('%%ByStudyLanguageEmptyPlaces%%', priorityByStudyLanguage);
                    PriorityPlaceCount = PriorityPlaceCount.replace('%%PriorityPlaceDate%%', key);
                  }
                }

              }
            });

            ageGroupText = ageGroupText.replace('%%Name%%', data.ageGroups[i]);
            ageGroupText = ageGroupText.replace('%%GeneralPlaceCount%%', GeneralPlaceCount);
            ageGroupText = ageGroupText.replace('%%PriorityPlaceCount%%', PriorityPlaceCount);
          }

          allAgeGroupText = allAgeGroupText + ageGroupText;
        });

        templateString = templateString.replace('%%AgeGroupInfos%%', allAgeGroupText);
        templateString = templateString.replace('%%gardenId%%', value['i']);
        templateString = templateString.replace('%%IdGarden%%', value['i']);

        $('.free-places-result-block').append(templateString);
      });

      $('.free-places-result-text').html('');
      $('.free-places-result-text').append(data.resultText);
      $('.g-callout-warning').show();
    } else {
      $('.g-callout-warning').hide();
      $('.search-empty-result-block').show();

      //            $('.search-empty-result-block').removeClass('hidden');
    }
  },
  searchByName: function () {
    searchString = $('#search-word').val();

    var isResutlsExist = false;

    if (this.data) {
      var i = 0;
      $.each(this.data.results, function (key, value) {
        if (searchString == '' || value['n'].toUpperCase().indexOf(searchString.toUpperCase()) != -1) {
          isResutlsExist = true;
          $('.free-place-search-result-' + value['i']).show();
          i++;
        } else {
          $('.free-place-search-result-' + value['i']).hide();
        }

      });
      $('#free-places-res-amount').text(i);
      if (isResutlsExist) {
        $('.g-callout-warning').show();

        $('.search-empty-result-block').hide();
      } else {
        $('.g-callout-warning').hide();

        $('.search-empty-result-block').show();
      }
    } else {
      $('.search-empty-result-block').show();
    }
  }
};

Attendance = {
  removeRowFromTable: function (selector, cell) {
    $(selector).remove();
    $('.current_month_days_absent_error_' + cell).removeClass('check_mark_w');
    $('.current_month_days_absent_error_' + cell).removeClass('check_mark_b');
  },
  showLoadedDoc: function () {
    let typeFile = document.querySelector('.down-doc');
    let link = document.querySelector('.show-down-doc');

    typeFile.addEventListener('change', function () {
      link.textContent = typeFile.value;
    });
  },
  setDays: function () {
    const currentMontDays = document.querySelectorAll('.current_month_days_absent_error');
    for (let i = 0; i < currentMontDays.length; i++) {
      currentMontDays[i].addEventListener('click', function () {
        if (currentMontDays[i].classList.contains('red')) {
          currentMontDays[i].classList.toggle('check_mark_w');
        } else {
          currentMontDays[i].classList.toggle('check_mark_b');
        }

        var cell = $(currentMontDays[i]).data('cell');

        if (!currentMontDays[i].classList.contains('check_mark_w') && !currentMontDays[i].classList.contains('check_mark_b')) {
          if ($('*').is('.added-error-opinion-row-' + cell)) {
            $('.added-error-opinion-row-' + cell).remove();
          }
        } else {
          var opinion = $(currentMontDays[i]).data('gardenopinion');
          var dateReadable = $(currentMontDays[i]).data('datereadable');
          var badgeColor = $(currentMontDays[i]).data('badgecolor');
          var badgeText = $(currentMontDays[i]).data('badgetext');
          var parentOpinion = $(currentMontDays[i]).data('parentopinion');
          var parentOpinionInt = 1;
          if (opinion == 1) {
            parentOpinionInt = 0;
          }

          NProgress.start();
          var stringRow =
            '<div class="row list_item align-items-center added-error-opinion-row-' + cell + '">'
            + '<div class="col-4">'
            + '<div class="date">' + dateReadable + '</div>'
            + '</div>'
            + '<div class="col-3">'
            + '<span class="reason-badge ' + badgeColor + '">'
            + badgeText
            + '</span>'
            + '<div class="d-none">'
            + '<input type="hidden" name="parentOpinion[' + cell + ']" value="' + parentOpinionInt + '">'
            + '</div>'
            + '</div>'
            + '<div class="col-3">'
            + parentOpinion
            + '</div>'
            + '<div class="col-2">'
            + '<a class="btn btn-outline-black btn-block" href="#" onclick="Attendance.removeRowFromTable(\'.added-error-opinion-row-' + cell + '\', ' + cell + ')">' + Messages['DELETE'] + '</a>'
            + '</div>'
            + '</div>';

          $('.error-absent-table-parent-opinion').append(stringRow);
          NProgress.done();
        }
      })
    }
  }
}

$(document).ready(function () {
  $.post("/" + $('body').attr("data-lang") + "/cities-block", function (data) {
    $("#cities-block").html(data);
  });
});

$('[data-target="#feedbackModal"]').click(function (event) {
  event.preventDefault();
  $.get($(this).attr('href'), function (html) {
    $('#feedbackModal .modal-content').html(html);
  });
});
$("#defaultModal").on("hidden.bs.modal", function () {
  $("#defaultModal .modal-content").html("");
});

$(document).on('click', '.fake-block', function () {
  Alert.error(Messages['SUPPORT_OFF']);
});

$(document).on('click', '.fake-block', function () {
  if ($(this).attr('data-busy') === 'true') {
    Alert.success(Messages['SUPPORT_BUSY'])
  } else {
    Alert.error(Messages['SUPPORT_OFF']);
  }
});


Contracts = {
  viewTypicalContract: function (directionsData) {
    var direction = parseInt($('#direction-selector').val());
    var jsonData = eval('(' + directionsData + ')');
    var directionInfo = jsonData[direction];

    if (directionInfo) {
      $.post('/' + lang + '/cabinet/contracts/get-typical-contract', {
        type: directionInfo.contractType,
        organization: directionInfo.kindergardenId,
      }).done(function (response) {
        console.log(response);
        if (response) {
          $('.typical-contract-block').removeClass('d-none');
          $('.typical-contract-download-link').attr('href', 'data:' + response.MimeType + ';base64,' + response.Content);
        }
      });
    }
    else {
      $('.typical-contract-block').addClass('d-none');
      $('.typical-contract-download-link').attr('href', '')
    }
  },
  setDefaultRequisites: function () {
    $('*[data-default-value]').each(function (i, item) {
      $(item).val($(item).data('default-value'));
      $(item).trigger('change');
    });
  },
  checkAuthSign: function () {
    var fileInput = $('#auth-sign');
    var passwordInput = $('#auth-sign-password');
    var fd = new FormData;
    fd.append('sign', fileInput.prop('files')[0]);
    fd.append('password', passwordInput.val());
    // show modal of checking sign
    $('#modalCheckSignForm').modal('show');
    $('#hide-all-page-to-behind-transparent-block').removeClass('d-none');
    $('#is-valid-sign-input').val('');
    $.ajax({
      url: '/' + lang + '/cabinet/contracts/check-auth-sign',
      data: fd,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function (data) {
        console.log(data);
        $('#click-check-eds-button-message').addClass('d-none');
        setTimeout(function () {
          $('#modalCheckSignForm').modal('hide');
        }, 1000);
        if (data.Success == true) {
          $('#is-valid-sign-input').val(1).change();
        }
        else if (data.Success == false) {
          $('#modalCheckForm').modal('hide')
          $('#modalCheckSignForm').modal('hide')
          $('#modalLoader').modal('hide')
          $('#modalCheckSignErrorForm').modal('show');
          $('#check-sign-error-form-reason').html(data.Description);
        }
        $('#hide-all-page-to-behind-transparent-block').addClass('d-none');
      }
    });
  },
  checkAuthSignButtonState: function () {
    var pass = $('#auth-sign-password').val();
    var fileInput = $('#auth-sign');
    if (pass.length != 0 && fileInput.val().replace()) {
      $('#check-auth-sign-button').removeAttr('disabled');
      $('#click-check-eds-button-message').removeClass('d-none');
    } else {
      $('#check-auth-sign-button').attr('disabled', 'disabled');
      $('#click-check-eds-button-message').addClass('d-none');
    }
  },
  submitButtonStateWithAgreement: function () {
    $('#agreement-checkbox').change(function () {
      if (this.checked) {
        $('#contract-form-submit-button').removeAttr('disabled');
      }
      else {
        $('#contract-form-submit-button').attr('disabled', true);
      }
    });
  },
  deleteFileServerRequest: function (id) {
    let url = '/' + lang + '/cabinet/contracts/delete-file?id=' + id;

    $.get(url);

    return true;
  },
  sign: function () {
    var fileInput = $('#sign-file');
    var passwordInput = $('#sign-password');
    var fd = new FormData;
    fd.append('sign', fileInput.prop('files')[0]);
    fd.append('password', passwordInput.val());
    // show modal of checking sign
    $('#modalCheckSignForm').modal('show');
    $('#hide-all-page-to-behind-transparent-block').removeClass('d-none');
    $('#is-valid-sign-input').val('');
    $.ajax({
      url: '/' + lang + '/cabinet/contracts/sign',
      data: fd,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function (data) {
        console.log(data);
        $('#modalCheckSignForm').modal('hide');
        if (data.Success == true) {
          showLoader()
          window.location.href = data.redirectUrl;
        }
        else if (data.Success && data.SignatureFails) {
          Alert.error(data.Description)
        }
        else if (data.Success == false && (data.SignatureFails == null || data.SignatureFails == undefined)) {
          $('#modalCheckForm').modal('hide')
          $('#modalCheckSignForm').modal('hide')
          $('#modalLoader').modal('hide')
          $('#check-sign-error-form-reason').html(data.Description);
          $('#modalCheckSignErrorForm').modal('show');
        }
        $('#hide-all-page-to-behind-transparent-block').addClass('d-none');
      }
    });
  },
  toggleReasonNoteFieldByReasonId: function (inputSelector, showValue, reasonNoteSelector) {
    var reasonId = $(inputSelector).val();

    if (parseInt(reasonId) == showValue) {
      $(reasonNoteSelector).removeClass('d-none');
    }
    else {
      $(reasonNoteSelector).addClass('d-none');
    }
  },
  cancelSigning: function () {
    var fileInput = $('#sign-file');
    var passwordInput = $('#sign-password');
    var action = $('#sign-action');
    var fd = new FormData;
    fd.append('sign', fileInput.prop('files')[0]);
    fd.append('password', passwordInput.val());
    fd.append('action', action.val());
    // show modal of checking sign
    $('#modalCheckSignForm').modal('show');
    $('#hide-all-page-to-behind-transparent-block').removeClass('d-none');
    $.ajax({
      url: '/' + lang + '/cabinet/contracts/cancel-sign',
      data: fd,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function (data) {
        console.log(data);
        $('#modalCheckSignForm').modal('hide');
        if (data.Success == true) {
          window.location.href = data.redirectUrl;
        }
        else if (data.Success == false && data.SignatureFails) {
          Alert.error(data.Description)
        }
        else if (data.Success == false && (data.SignatureFails == null || data.SignatureFails == undefined)) {
          $('#modalCheckForm').modal('hide')
          $('#modalCheckSignForm').modal('hide')
          $('#modalLoader').modal('hide')
          $('#check-sign-error-form-reason').html(data.Description);
          $('#modalCheckSignErrorForm').modal('show');
        }
        $('#hide-all-page-to-behind-transparent-block').addClass('d-none');
      }
    });
  },
  setBikByBankId: function (bankSelector, bikSelector) {
    var bikData = $(bankSelector).data('bik-list');
    var bankValue = parseInt($(bankSelector).val());
    $(bikSelector).val(bikData[bankValue]);
  },
  showChildInfoBySelectedDirection: function (selector, viewBlockSelector) {
    var direction = $(selector).val();

    if (!direction) {
      return;
    }

    $.post('/' + lang + '/cabinet/contracts/direction-child-info', {
      direction: direction,
    }).done(function (response) {
      $(viewBlockSelector).html(response);
    });
  },
  downloadFile: function (obj) {
    var inputFile = $(obj).data('file-input');
    var selectedFilePath = $('#' + inputFile)[0].files[0];

    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    url = window.URL.createObjectURL(selectedFilePath);
    a.href = url;
    a.download = selectedFilePath.name;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

function viewSelectedFileSize(fileInputId, sizeBlockSelector) {
  var fileSize = $('#' + fileInputId)[0].files[0].size;
  $(sizeBlockSelector).html(readableBytes(fileSize));
}

function viewSelectedFileName(fileInputId, sizeBlockSelector) {
  var fileName = $('#' + fileInputId)[0].files[0].name;
  $(sizeBlockSelector).html(fileName);
}

function readableBytes(bytes) {
  var i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

$(document).ready(function () {
  $(".file-upload input[type=file]").change(function () {
    var filename = $(this).val().replace();

    $("#filename").val(filename);
  });
});

// Кнопка "Добавить" больше 3 элементов
settingsCardAdd();
function settingsCardAdd() {
  const settingsCardsBox = document.querySelectorAll('.settings-card');

  if (settingsCardsBox) {
    settingsCardsBox.forEach(box => {
      console.log(box);
      const settingsCards = box.querySelectorAll('.list-item');
      const addBtn = box.querySelectorAll('.addBlock');

      console.log(settingsCards);
      if (settingsCards.length >= 3) {
        addBtn.forEach(btn => {
          btn.classList.toggle('d-none');
        })
      }
    });
  }
}

//add
addPhoto();

function addPhoto() {
  let inputTypeFile = document.querySelector(".object__add-photo input[type=file]");
  let inputTypeFileLabel = document.querySelector(".object__add-photo label");
  let deletePreview = document.querySelector(".object__add-photo .delete-btn");
  let addPreview = document.querySelector(".object__add-photo .buttons-bar__add .js-text");
  let errorBlock = document.querySelector(".object__add-photo .invalid-feedback");

  if (inputTypeFile || inputTypeFileLabel || deletePreview) {
    deletePreview.addEventListener('click', function (e) {
      $('label[for="addPhoto"]').trigger('photoDeleted');
      e.preventDefault();
      inputTypeFileLabel.style.backgroundImage = "none";
      inputTypeFileLabel.classList.remove('remove-pseudo-classes');
      inputTypeFile.value = '';
      deletePreview.classList.remove('show');
      addPreview.textContent = 'Добавить';
    });
    inputTypeFile.addEventListener("change", function () {

      if (this.files[0]) {
        let fr = new FileReader();

        fr.addEventListener("load", function () {
          inputTypeFileLabel.style.backgroundImage = "url(" + fr.result + ")";
          inputTypeFileLabel.classList.add('remove-pseudo-classes');
          deletePreview.classList.add('show');
          addPreview.textContent = 'Изменить';
        }, false);

        fr.readAsDataURL(this.files[0]);


        // errorBlock.style.display = 'none';
      }
    });
  }
}

function showLoader() {
  $('#modalLoader').modal({ backdrop: 'static', keyboard: false }, 'show');
}
function hideLoader() {
  $('#modalLoader').modal('hide');
}
function showButtonLoader(id) {
  id = '#' + id
  $(id).addClass('disabled')
  $(id + ' img').show()
}

$('[with-submit-loader]').on('beforeSubmit', function (e) {
  showLoader();
});

function validatePasswordInput(inputId) {
  let inputValue = $('#' + inputId).val();
  let latinLowerRegex = new RegExp('(?=.*[a-z])');
  let latinUpperRegex = new RegExp('(?=.*[A-Z])');
  let numberRegex = new RegExp('(?=.*[0-9])');
  let specialRegex = new RegExp('(?=.*[!@#$%^&*])');

  if (inputValue.length >= 12) {
    $('#min-length-' + inputId).addClass('is-valid');
  }
  else {
    $('#min-length-' + inputId).removeClass('is-valid');
  }
  if (latinLowerRegex.test(inputValue)) {
    $('#latin-lower-symbol-' + inputId).addClass('is-valid');
  }
  else {
    $('#latin-lower-symbol-' + inputId).removeClass('is-valid');
  }
  if (latinUpperRegex.test(inputValue)) {
    $('#latin-upper-symbol-' + inputId).addClass('is-valid');
  }
  else {
    $('#latin-upper-symbol-' + inputId).removeClass('is-valid');
  }
  if (numberRegex.test(inputValue)) {
    $('#digit-symbol-' + inputId).addClass('is-valid');
  }
  else {
    $('#digit-symbol-' + inputId).removeClass('is-valid');
  }
  if (specialRegex.test(inputValue)) {
    $('#special-symbol-' + inputId).addClass('is-valid');
  }
  else {
    $('#special-symbol-' + inputId).removeClass('is-valid');
  }
}

$(document).on('click', '[check-api-perm]', function () {
  let link = $(this).attr('href');

  $.ajax({
    type: 'get',
    url: $(this).attr('check-api-perm'),
  }).done(function (res) {
    if (res.IsSuccess === true) {
      location.href = link;
    } else {
      Alert.error(res.ErrorMessage);
    }
  });

  return false;
});

$(document).on('click', 'a.cancel-direction', function () {
  let link = $(this).attr('href');

  $.ajax({
    type: 'get',
    url: link,
  }).done(function (res) {
    if (res === true) {
      $('.modal').modal('hide');
      $.pjax.reload({
        container: '#my-directions-pjax',
        async: false
      });
    } else {
      Alert.error(res.ErrorMessage);
    }

    NProgress.done();
  });

  return false;
});

Qr = {
  qrBlockId: 'qr-scan-block',
  qrBlockLoaderId: 'qr-scan-block-loader',
  qrBlockViewId: 'qr-scan-block-view',
  resultScanBlockId: 'qr-scan-result-block',
  qrImageId: 'qr-image',
  qrLinkId: 'qr-link',
  qrReloadImageId: 'qr-reload-image',
  qrReloadLinkId: 'qr-reload-link',
  nexStepBlockId: 'next-step-buttons-block',
  intervalId: null,
  tryCountElementSelector: '.try-number',
  tryCount: 1,
  resendLink: '',
  setQrBlockId: function (id) {
    this.qrBlockId = id;
  },
  setQrBlockLoaderId: function (id) {
    this.qrBlockLoaderId = id;
  },
  setQrBlockViewId: function (id) {
    this.qrBlockViewId = id;
  },
  setResultScanBlockId: function (id) {
    this.resultScanBlockId = id;
  },
  setQrImageId: function (id) {
    this.qrImageId = id;
  },
  setQrLinkId: function (id) {
    this.qrLinkId = id;
  },
  setQrReloadImageId: function (id) {
    this.qrReloadImageId = id;
  },
  setQrReloadLinkId: function (id) {
    this.qrReloadLinkId = id;
  },
  setNexStepBlockId: function (id) {
    this.nexStepBlockId = id;
  },
  setTryCountElementSelector: function (selector) {
    this.tryCountElementSelector = selector;
  },
  setResendLink: function (link) {
    this.resendLink = link;
  },
  setReloadLinkId: function (id) {
    this.reloadLinkId = id;
  },
  init: function (address, action, lifetime, timeEnd, connectLimit, resend = false) {
    $('#' + this.qrBlockViewId).hide();
    $('#' + this.qrBlockLoaderId).show();
    let self = this;
    let ws = new WebSocket(address);
    $(this.tryCountElementSelector).text(this.tryCount);
    ws.onopen = function (e) {
      $('#' + self.qrBlockViewId).show();
      $('#' + self.qrBlockLoaderId).hide();
      let generateMessage = JSON.stringify({ action: action });
      ws.send(generateMessage);
      self.intervalId = setInterval(function () {
        ws.send(generateMessage);
        if (self.getCurrentTimeStamp() > timeEnd) {
          self.showReloadButton();
          clearInterval(self.intervalId);
        }
      }, lifetime * 1000);
    };
    ws.onclose = function (e) {
      clearInterval(self.intervalId);
      $('#' + this.qrBlockViewId).show();
      $('#' + this.qrBlockLoaderId).hide();
      self.showReloadButton();
    };
    ws.onerror = function (e) {
      clearInterval(self.intervalId);
      setTimeout(function () {
        if (self.getCurrentTimeStamp() < (timeEnd - connectLimit)) {
          self.tryCount++;
          self.init(address, action, lifetime, timeEnd, connectLimit, resend);
        }
        else {
          if (resend) {
            window.location.href = self.resendLink;
          }
          else {
            clearInterval(self.intervalId);
            self.showButton(false);
            Alert.error(Messages['SOCKET_CONNECT_CLOSED']);
          }
        }
      }, lifetime * 1000);
    };
    ws.onmessage = function (e) {
      let element = document.getElementById(self.qrImageId);
      let elementLink = document.getElementById(self.qrLinkId);
      let jsonData = JSON.parse(e.data);
      if (jsonData.action == action) {
        self.showReloadButton(false);
        element.src = '';
        elementLink.href = '';
        if (jsonData.status == true) {
          element.src = jsonData.data;
          let link = elementLink.dataset.link;
          if (link.indexOf('https//') === -1) {
            link.replace('https//', 'https://')
          }

          elementLink.href = link.replace('{token}', jsonData.token);
        }
      }
      else if (jsonData.action == 'validate') {
        if (jsonData.status == true) {
          let url = '/' + lang + '/cabinet/personal/qr-checked'
          $.ajax({
            type: 'POST',
            url: url
          })
          self.showButton();
          clearInterval(self.intervalId);
        }
      }
    };
  },
  getCurrentTimeStamp: function () {
    return parseInt(new Date().getTime() / 1000);
  },
  showButton: function (showResultScan = true) {
    let buttonElement = document.getElementById(this.resultScanBlockId);
    let qrElement = document.getElementById(this.qrBlockViewId);
    let nexStepBlock = document.getElementById(this.nexStepBlockId);
    buttonElement.style.display = showResultScan ? 'block' : 'none';
    nexStepBlock.style.display = 'block';
    qrElement.style.display = 'none';
  },
  showReloadButton: function (show = true) {
    if (show == true) {
      $('#' + this.qrReloadImageId).show();
      $('#' + this.qrImageId).hide();
      $('#' + this.qrLinkId).hide();
      $('#' + this.qrReloadLinkId).show();
    }
    else {
      $('#' + this.qrReloadImageId).hide();
      $('#' + this.qrImageId).show();
      $('#' + this.qrLinkId).show();
      $('#' + this.qrReloadLinkId).hide();
    }
  }
};

QrStatement = {
  qrBlockId: 'qr-scan-block',
  qrBlockLoaderId: 'qr-scan-block-loader',
  qrBlockViewId: 'qr-scan-block-view',
  resultScanBlockId: 'qr-scan-result-block',
  qrImageId: 'qr-image',
  qrLinkId: 'qr-link',
  qrReloadImageId: 'qr-reload-image',
  qrReloadLinkId: 'qr-reload-link',
  nexStepBlockId: 'next-step-buttons-block',
  intervalId: null,
  tryCountElementSelector: '.try-number',
  tryCount: 1,
  resendLink: '',
  resendLinkId: 'qr-resend-link',
  setQrBlockId: function (id) {
    this.qrBlockId = id;
  },
  setQrBlockLoaderId: function (id) {
    this.qrBlockLoaderId = id;
  },
  setQrBlockViewId: function (id) {
    this.qrBlockViewId = id;
  },
  setResultScanBlockId: function (id) {
    this.resultScanBlockId = id;
  },
  setQrImageId: function (id) {
    this.qrImageId = id;
  },
  setQrLinkId: function (id) {
    this.qrLinkId = id;
  },
  setQrReloadImageId: function (id) {
    this.qrReloadImageId = id;
  },
  setQrReloadLinkId: function (id) {
    this.qrReloadLinkId = id;
  },
  setNexStepBlockId: function (id) {
    this.nexStepBlockId = id;
  },
  setTryCountElementSelector: function (selector) {
    this.tryCountElementSelector = selector;
  },
  setResendLink: function (link) {
    this.resendLink = link;
  },
  setResendLinkId: function (id) {
    this.resendLinkId = id;
  },
  setReloadLinkId: function (id) {
    this.reloadLinkId = id;
  },
  init: function (address, action, lifetime, timeEnd, connectLimit, resend = false) {
    $('#' + this.qrBlockViewId).hide();
    $('#' + this.qrBlockLoaderId).show();
    let self = this;
    let ws = new WebSocket(address);
    $(this.tryCountElementSelector).text(this.tryCount);
    ws.onopen = function (e) {
      $('#' + self.qrBlockViewId).show();
      $('#' + self.qrBlockLoaderId).hide();
      let generateMessage = JSON.stringify({ action: action });
      ws.send(generateMessage);
      self.intervalId = setInterval(function () {
        ws.send(generateMessage);
        if (self.getCurrentTimeStamp() > timeEnd) {
          clearInterval(self.intervalId);
        }
      }, lifetime * 1000);
    };
    ws.onclose = function (e) {
      clearInterval(self.intervalId);
      $('#' + this.qrBlockViewId).show();
      $('#' + this.qrBlockLoaderId).hide();
      self.showReloadButton();
    };
    ws.onerror = function (e) {
      clearInterval(self.intervalId);
      setTimeout(function () {
        if (self.getCurrentTimeStamp() < (timeEnd - connectLimit)) {
          self.tryCount++;
          self.init(address, action, lifetime, timeEnd, connectLimit, resend);
        }
        else {
          if (resend) {
            window.location.href = $('#' + self.resendLinkId).attr('href');
          }
          else {
            clearInterval(self.intervalId);
            self.showButton(false);
            Alert.error(Messages['SOCKET_CONNECT_CLOSED']);
          }
        }
      }, lifetime * 1000);
    };
    ws.onmessage = function (e) {
      let element = document.getElementById(self.qrImageId);
      let elementLink = document.getElementById(self.qrLinkId);
      let jsonData = JSON.parse(e.data);
      if (jsonData.action == action) {
        self.showReloadButton(false);
        element.src = '';
        elementLink.href = '';
        if (jsonData.status == true) {
          element.src = jsonData.data;
          let link = elementLink.dataset.link;
          if (link.indexOf('https//') === -1) {
            link.replace('https//', 'https://')
          }
          elementLink.href = link.replace('{token}', jsonData.token);
        }
      }
      else if (jsonData.action == 'validate') {
        if (jsonData.status == true) {
          self.showButton();
          clearInterval(self.intervalId);
        }
      }
    };
  },
  getCurrentTimeStamp: function () {
    return parseInt(new Date().getTime() / 1000);
  },
  showButton: function (showResultScan = true) {
    let buttonElement = document.getElementById(this.resultScanBlockId);
    let qrElement = document.getElementById(this.qrBlockViewId);
    let nexStepBlock = document.getElementById(this.nexStepBlockId);
    buttonElement.style.display = showResultScan ? 'block' : 'none';
    nexStepBlock.style.display = 'block';
    qrElement.style.display = 'none';
  },
  showReloadButton: function (show = true) {
    if (show == true) {
      $('#' + this.qrReloadImageId).show();
      $('#' + this.qrImageId).hide();
      $('#' + this.qrLinkId).hide();
      $('#' + this.qrReloadLinkId).show();
    }
    else {
      $('#' + this.qrReloadImageId).hide();
      $('#' + this.qrImageId).show();
      $('#' + this.qrLinkId).show();
      $('#' + this.qrReloadLinkId).hide();
    }
  }
};
function jivo_onLoadCallback() {
  if (Config.OpenJivo) {
    jivo_api.open()
  }
}