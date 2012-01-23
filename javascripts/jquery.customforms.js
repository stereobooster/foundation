/*
 * jQuery Custom Forms Plugin 1.0
 * www.ZURB.com
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

(function ($) {

  var $currentDropdown,
      currentPosition = 0,
      focus,
      $document = $(document),
      ownEvent = 'foundation',
      maxVisibleOptions = 10;

  function appendCustomMarkup(type) {
    $('form.custom input:' + type).each(function () {

      var $this = $(this).removeAttr('style').addClass('customized'),
          $span = $this.next('span.custom.' + type);

      if ($span.length === 0) {
        $span = $('<span class="custom ' + type + '"></span>').insertAfter($this);
      }

      $span.toggleClass('checked', $this.is(':checked'))
        .toggleClass('disabled', $this.is(':disabled'));
    });
  }

  function refreshCustomSelect($select, append) {
    var $customSelect = $select.next(append ? 'div.custom.dropdown' : ''),
        $options = $select.find('option'),
        maxWidth = 0,
        outerWidth,
        li = '',
        $ul,
        html,
        $li;

    if (append && $customSelect.length === 0) {
      $customSelect = $('<div class="custom dropdown"><span class="selector"></span><ul></ul></div>"');
      $customSelect.prepend('<span class="current">' + $options.first().html() + '</span>');

      $select.after($customSelect);
      $ul = $customSelect.find('ul');
    } else {
      $ul = $customSelect.find('ul').html('');
      $customSelect.removeAttr('style');
      $ul.removeAttr('style');  
    }

    if (append) {
      $customSelect.toggleClass('disabled', $select.is(':disabled'));
      $select.removeAttr('style').addClass('customized');
    }

    $options.each(function () {
      html = $(this).html();
      li += '<li';
      if (this.selected) {
        li += ' class="selected"';
        $customSelect.find('.current').html(html);
      }
      li += '>' + html + '</li>';
    });
    $ul.append(li);

    $li = $customSelect.find('li');

    // fix width
    $li.each(function () {
      $customSelect.addClass('open');
      outerWidth = $(this).outerWidth();
      if (outerWidth > maxWidth) {
        maxWidth = outerWidth;
      }
      $customSelect.removeClass('open');
    });

    $customSelect.css('width', maxWidth + 18 + 'px');
    $ul.css('width', maxWidth + 16 + 'px');

    if ($li.length > maxVisibleOptions) {
      $customSelect.addClass('open');
      $ul.css('height', $li.first().outerHeight() * maxVisibleOptions + 'px')
        .css('overflow-y', 'scroll')
        .css('overflow-x', 'hidden');
      $customSelect.removeClass('open');
    }
  }

  $(function () {

    appendCustomMarkup('checkbox');
    appendCustomMarkup('radio');

    $('form.custom select').each(function () {
      refreshCustomSelect($(this), true);
    });

  });

  function toggleCheckbox($element) {
    var $input = $element.prev(),
        input = $input[0];

    if (!$input.is(':disabled')) {
        input.checked = !input.checked;
        $element.toggleClass('checked');

        $input.trigger('change');
    }
  }
  
  function toggleRadio($element) {
    var $input = $element.prev(),
        input = $input[0];

    $('input:radio[name="' + $input.attr('name') + '"]').each(function () {
      $(this).next().removeClass('checked');
    });
    input.checked = !input.checked;
    $element.toggleClass('checked');
    
    $input.trigger('change');
  }
  
  $('form.custom span.custom.checkbox').live('click', function (event) {
    toggleCheckbox($(this));
    return false;
  });
  
  $('form.custom span.custom.radio').live('click', function (event) {
    toggleRadio($(this));
    return false;
  });

  $('form.custom select').live('change', function (event, own) {
    if (own !== ownEvent) {
      refreshCustomSelect($(this));
    }
  });

  $('form.custom label').live('click', function (event) {
    var $this = $(this),
        $associatedElement = $('#' + $this.attr('for')),
        spanSelector = 'span.custom.',
        type;
    if ($associatedElement.length !== 0) {
      type = $associatedElement.attr('type');
      if (type === 'checkbox') {
        event.preventDefault();
        toggleCheckbox($this.find(spanSelector + type));
      } else if (type === 'radio') {
        event.preventDefault();
        toggleRadio($this.find(spanSelector + type));
      }
    }
  });

  function dropdownChange ($dropdown, selected) {
    $currentDropdown = $dropdown;
    if ($currentDropdown) {
      currentPosition = $currentDropdown.prev()[0].selectedIndex;
      if (selected) {
        var $currentLi = $currentDropdown.find('li')
              .removeClass('selected hover')
              .eq(currentPosition).addClass('selected');

          if (currentPosition > maxVisibleOptions - 1) {
            $currentDropdown.find('ul').scrollTop(currentPosition * $currentLi.outerHeight());
          }
      }  
    }
  }

  function changeFocus(target, focused) {
    var $input = $(target).next().toggleClass('focus', focused);
    if (target.nodeName.toLowerCase() == 'select') {
      dropdownChange(focused && $input);
      focus = focused;
    }
  }

  $('form.custom .customized').live('focus', function (event) {
    changeFocus(this, true);
  });

  $('form.custom .customized').live('blur', function (event) {
    changeFocus(this, false);
  });

  $document.bind('keydown', function (event) {
    if ($currentDropdown) {
      if (event.keyCode == 9) { //tab
        $document.trigger('click.customdropdown');
      }
    }
  });

  $document.bind('keyup', function (event) {
    if ($currentDropdown) {
      currentPosition = event.target.selectedIndex;

      var $li = $currentDropdown.find('li'),
          $currentLi = $li.eq(currentPosition),
          keyCode = event.keyCode,
          $select = $(event.target);

      $currentDropdown.find('.current')
        .html($currentLi.html());

      if ($currentDropdown.hasClass('open')) {

        if (keyCode == 13 || keyCode == 27) { //return & escape
          $currentDropdown.removeClass('open');
          $document.unbind('.customdropdown');
          $select.trigger('change', [ownEvent]);
          return true;
        }

        $li.removeClass('selected hover');
        $currentLi.addClass('selected hover');

        if ($li.length > maxVisibleOptions) {
          $currentDropdown.find('ul').scrollTop(currentPosition * $currentLi.outerHeight());
        }
      }
    }
  });

  $('form.custom div.custom.dropdown .current, form.custom div.custom.dropdown .selector').live('click', function (event) {
    var $this = $(this),
        $dropdown = $this.closest('div.custom.dropdown');
    
    event.preventDefault();
    
    if (!$dropdown.prev().is(':disabled')) {
        if (!$dropdown.hasClass('open')) {
          $document.trigger('click.customdropdown');
        }
        $dropdown.toggleClass('open');
        $dropdown.prev().focus();
        if ($dropdown.hasClass('open')) {
          $document.bind('click.customdropdown', function (event) {
            $dropdown.removeClass('open');
            dropdownChange();
            if ($(event.target).closest('div.custom.dropdown').length == 0) {
                $document.unbind('.customdropdown');
            }
          });
          dropdownChange($dropdown, true);
          return false;
        } else {
          dropdownChange();
          $document.unbind('.customdropdown');
        }
    }
  });

  $('form.custom div.custom.dropdown li').live('click', function (event) {
    var $this = $(this),
        $customDropdown = $this.closest('div.custom.dropdown'),
        $select = $customDropdown.prev(),
        selectedIndex = 0;
        
    event.preventDefault();
    event.stopPropagation();
    $document.unbind('.customdropdown');

    $this
      .closest('ul')
      .find('li')
      .removeClass('selected hover');
    $this.addClass('selected');
    
    $customDropdown
      .removeClass('open')
      .find('.current')
      .html($this.html());
    
    $this.closest('ul').find('li').each(function (index) {
      if ($this[0] == this) {
        selectedIndex = index;
      }
      
    });
    $select[0].selectedIndex = selectedIndex;
    $select.trigger('change', [ownEvent]);
    $select.focus();
  });
})(jQuery);