import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Component.extend(KeyboardShortcuts, {
  classNames: ['visibility-setting-list'],

  keyboardShortcuts: {
    'esc': 'closeConfirmationModal'
  },

  options: [],
  selected: '',
  isShowingConfirmationModal: false,
  currentSelection: reads('selected'),
  currentSelectionIndex: computed('currentSelection', 'options',
    function () {
      return this.options.findIndex((el) => el.value === this.currentSelection);
    }
  ),
  currentSelectionObj: computed('currentSelectionIndex', 'options',
    function () {
      if (typeof this.currentSelectionIndex !== 'number' || this.currentSelectionIndex < 0) {
        return {};
      }
      return this.options[this.currentSelectionIndex];
    }
  ),

  change: computed('selected', 'currentSelection', 'options',
    function () {
      const oldIndex = this.options.findIndex((el) => el.value === this.selected);
      const newIndex = this.options.findIndex((el) => el.value === this.currentSelection);

      return newIndex - oldIndex;
    }
  ),

  modalHeaderText: computed('change', function () {
    let operation;
    if (this.change < 0) {
      operation = 'Restrict';
    } else if (this.change > 0) {
      operation = 'Increase';
    } else {
      operation = 'Update';
    }

    return `${operation} visibility of your private build insights`;
  }),
  modalBodyText: computed('change', 'currentSelectionObj', function () {
    if (this.change === 0) {
      return 'Visibility update is in progress';
    }
    const selection = this.currentSelectionObj;

    if (selection.hasOwnProperty('modalText')) {
      return selection.modalText;
    }

    return `
This change will make your private build insights
${this.change < 0 ? 'only' : ''}
available to
${selection.displayValue || selection.value}
`;
  }),

  didRender() {
    this._super(...arguments);
    let af = this.get('element').querySelector('[autofocus]');
    if (this.get('isShowingConfirmationModal') === true && af !== null) {
      af.focus();
    }
  },

  actions: {
    confirm() {
      this.set('isShowingConfirmationModal', false);
      this.sendAction('onConfirm', this.get('currentSelection'));
    },
    toggleConfirmationModal() {
      this.toggleProperty('isShowingConfirmationModal');
      if (this.get('isShowingConfirmationModal') !== true) {
        this.get('element').querySelector('.visibility-setting-list-item--selected').focus();
      }
    },
    closeConfirmationModal() {
      if (this.get('isShowingConfirmationModal') === true) {
        this.toggleProperty('isShowingConfirmationModal');
        this.get('element').querySelector('.visibility-setting-list-item--selected').focus();
      }
    }
  }
});
