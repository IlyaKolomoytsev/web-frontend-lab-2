// @ts-check
/// <reference path="./types.d.ts" />

import { getEquipmentGroups } from './data.js';
import { observeList } from './event-handlers.js';
import { dispatchShowGetFakeEquipments, dispatchRemoveAllGroups, dispatchRemoveAllEquipments, dispatchRemoveGroup, dispatchRemoveEquipment, dispatchShowEditGroupForm, dispatchShowEditEquipmentForm, dispatchToggleEquipment } from './events.js';
import { handleAddEquipment, handleAddEquipmentGroup, handleEditGroup, handleEditEquipment } from './form-handlers.js';
import { Maybe, fragment } from './helpers.js';
import { addIcon, backIcon, doneIcon, downloadIcon, editIcon, showIcon, progressIcon, removeIcon, hideIcon, homeIcon } from "./icons.js";

export function renderNotFound() {
  return fragment/*html*/`
    <h1 class="title container__title">PAGE NOT FOUND</h1>
  `;
}

export function renderGroups() {
  const groups = getEquipmentGroups();
  const page = fragment/*html*/`
    <div class="groups">
      <div class="header">
        <h1 class="title header__title">Groups of equipments</h1>
        <div class="header__toolbar toolbar">
          <button class="button button_danger" onclick="${dispatchRemoveAllGroups()}">
            ${removeIcon()}
            Remove all
          </button>
          <button class="button button_secondary toolbar__hide-button" id="minimize-button">
            ${document.querySelector(".create-form")?.offsetHeight > 0 || groups.length === 0
      ? 'Hide ' + hideIcon() : 'Show ' + showIcon()}
          </button>
        </div>
        <form class="groups__create-form create-form" style="height: ${groups.length === 0 ? 'auto' : 0}">
          <label class="create-form__form-label form-label">
            <span class="create-form__form-label-text">Add new group</span>
            <input class="input" type="text" placeholder="Add group title" name="title" ${validation('title')}>
          </label>
          <label class="create-form__form-label form-label">
            <span class="create-form__form-label-text">Add description</span>
            <input class="input" type="text" placeholder="Add description" name="description" ${validation('description')}>
          </label>          
          <button class="button button_primary create-form__add-button" type="submit">
            ${addIcon()}
            Add
          </button>
        </form>
      </div>
      <div class="groups__list list">
        ${
          groups.length === 0
          ? /*html*/`<h5 class="no-entries">No entries yet. Add new one using the form above.</h5>`
          : getEquipmentGroupsTemplate(groups)}
      </div>
    </div>
  `;
  Maybe.of(page.querySelector('.create-form'))
    .bind(form => form instanceof HTMLFormElement ? form : null)
    .do(form => form.addEventListener("submit", handleAddEquipmentGroup))
  Maybe.of(page.querySelector('.list')).do(observeList)
  return page;
}

export function getEquipmentGroupsTemplate(groups) {
  return groups.map(group => {
    return /*html*/`
      <div class="list__item card group" data-id="${group.id}">
        <div class="card__card-header card-header">
          <a class="card__link link" href="#/equipments/${group.id}">
            <h3 class="card-title card__card-title group__title">
              ${group.title}
            </h3>
            <div class="card__description description">${group.description}</div>
          </a>
        </div>
        <div class="card__toolbar toolbar">
          <button class="button button_primary" onclick="${dispatchShowEditGroupForm({ groupId: group.id })}">
            ${editIcon()}
            Edit
          </button>
          <button class="button button_danger" onclick="${dispatchRemoveGroup({ groupId: group.id })}">
            ${removeIcon()}
            Remove
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * 
 * @param {Group} group
 */
export function renderEquipments(group) {
  const page = fragment/*html*/`
    <div class="equipments" data-group-id="${group.id}">
      <div class="header">
        <h1 class="title header__title">${group.title}</h1>
        <div class="header__toolbar toolbar">
          <button class="button button_primary" onclick="window.location.hash = ''">
            ${homeIcon()}
            Home
          </button>
          <div class="dropdown">
            <div class="dropdown__action">
              <button class="button button_primary" id="dropdown__action-button">
                ${showIcon()}
                Actions
              </button>            
            </div>
            <div class="dropdown__content-wrapper">
              <div class="dropdown__content">
                <button class="button button_primary" onclick="${dispatchShowEditGroupForm({ groupId: group.id })}">
                  ${editIcon()}
                  Edit
                </button>
                <button class="button button_secondary" onclick="${dispatchShowGetFakeEquipments({ groupId: group.id })}">
                  ${downloadIcon()}
                  Fake equipments
                </button>
                <button class="button button_danger" onclick="${dispatchRemoveAllEquipments({ groupId: group.id })}">
                  ${removeIcon()}
                  Remove all
                </button>
                <button class="button button_danger" onclick="${dispatchRemoveGroup({ groupId: group.id })}">
                  ${removeIcon()}
                  Remove group
                </button>
              </div>
            </div>
          </div>
          <button class="button button_secondary toolbar__hide-button" id="minimize-button">
            ${document.querySelector(".create-form")?.offsetHeight > 0 || group.equipments.length === 0
      ? 'Hide ' + hideIcon() : 'Show ' + showIcon()}
          </button>
        </div>
        <form class="equipments__create-form create-form" style="height: ${group.equipments.length === 0 ? 'auto' : 0}">
          <label class="create-form__form-label form-label">
            <span class="create-form__form-label-text">Add new equipment</span>
            <input class="input" type="text" placeholder="Add equipment title" name="title" ${validation('title')}>
          </label>
          <label class="create-form__form-label form-label">
            <span class="create-form__form-label-text">Add description</span>
            <input class="input" type="text" placeholder="Add description" name="description" ${validation('description')}>
          </label>
          <button class="button button_primary create-form__add-button" type="submit">Add</button>
        </form>
      </div>
      <div class="equipment-filter">
        <label class="equipment-filter__label">
          <span class="equipment-filter__label-text">Filter by status</span>
          <select class="input" id="equipment-filter" name="done" onchange="window.dispatch?.call(null, 'filter-equipments', {groupId: ${group.id}, done: this.value})">
            <option value="all" selected>All</option>
            <option value="true">Done</option>
            <option value="false">In progress</option>
          </select>
        </label>
      </div>
      <div class="equipments__list list">
        ${group.equipments.length === 0
    ? /*html*/`<h5 class="no-entries">No entries yet. Add new one using the form above.</h5>`
      : getEquipmentsTemplate(group)
    }
      </div>
    </div>
    `
  page.querySelector('.create-form')?.addEventListener("submit", handleAddEquipment);
  Maybe.of(page.querySelector('.list')).do(observeList)
  return page;
}

/**
 * 
 * @param {Group} group 
 * @returns 
 */
export function getEquipmentsTemplate(group) {
  const { equipments } = group;
  return equipments.map(equipment => {
    return /*html*/`
      <div class="list__item card equipment" data-id="${equipment.id}">
        <div class="card__card-header card-header equipment-header ${equipment.done ? 'equipment-header_done' : ''}" 
          onclick="${dispatchToggleEquipment({ groupId: group.id, equipmentId: equipment.id })}">
          <h3 class="card-title card__card-title equipment__title ${equipment.done ? 'equipment-title_done' : ''}">
            ${equipment.title}
          </h3>
          <h5 class="equipment__status status">
            Status:     
            <span class="status__text">
              ${equipment.done ? `${doneIcon()} Done` : `${progressIcon()} In progress`}
            </span>        
          </h5>
          <div class="card__description description">${equipment.description}</div>
        </div>
        <div class="card__toolbar toolbar">
          <button class="button button_primary" onclick="${dispatchShowEditEquipmentForm({ groupId: group.id, equipmentId: equipment.id })}">
            ${editIcon()}
            Edit
          </button>
          <button class="button button_danger" onclick="${dispatchRemoveEquipment({ groupId: group.id, equipmentId: equipment.id })}">
            ${removeIcon()}
            Remove
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * 
 * @param {Equipment} equipment 
 * @returns 
 */
export function renderEditEquipmentForm(equipment) {
  const page = fragment/*html*/`
    <h1 class="title container__title">Edit equipment</h1>
    <form class="edit-form equipment-edit-form" data-group-id=${equipment.groupId} data-equipment-id=${equipment.id}>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit equipment title</span>
        <input class="input" type="text" placeholder="Edit equipment title" name="title" value="${equipment.title}" ${validation('title')}>
      </label>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit description</span>
        <input class="input" type="text" placeholder="Edit description" name="description" value="${equipment.description}" ${validation('description')}>
      </label>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit status</span>
        <select class="input" name="done">
          <option value="true" ${equipment.done ? 'selected' : ''}>Done</option>
          <option value="false" ${!equipment.done ? 'selected' : ''}>In progress</option>
        </select>
      </label>
      <button class="button button_primary" onclick="history.back()">
        ${backIcon()}
        Back
      </button>
      <button class="button button_primary edit-form__edit-button" type="submit">
        ${editIcon()}
        Edit
      </button>
    </form>
  `;
  page.querySelector('.edit-form')?.addEventListener("submit", handleEditEquipment);
  return page;
}
/**
 * 
 * @param {Group} group 
 * @returns 
 */
export function renderEditGroupForm(group) {
  const page = fragment/*html*/`
    <h1 class="title container__title">Edit equipment</h1>
    <form class="edit-form equipment-edit-form" data-group-id=${group.id}>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit equipment title</span>
        <input class="input" type="text" placeholder="Edit equipment title" name="title" value="${group.title}" ${validation('title')}>
      </label>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit description</span>
        <input class="input" type="text" placeholder="Edit description" name="description" value="${group.description}" ${validation('description')}>
      </label>
      <button class="button button_primary" onclick="history.back()">
        ${backIcon()}
        Back
      </button>
      <button class="button button_primary edit-form__edit-button" type="submit">
        ${editIcon()}
        Edit
      </button>
    </form>
  `;
  page.querySelector('.edit-form')?.addEventListener("submit", handleEditGroup);
  return page;
}

/**
 * 
 * @param {string} content 
 */
export function renderModal(content) {
  return fragment/*html*/`
    <div class="modal">
      <div class="modal__content">
        ${content}
      </div>
    </div>
  `
}

/**
 * 
 * @param {FakeUser[]} users
 * @param {number} groupId
 */
export function renderGetEquipmentsForm(users, groupId) {
  return /*html*/`
    <h2 class="title container__title">Select user for import</h2>
    <form class="edit-form equipment-edit-form" data-group-id=${groupId}>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Select user for import</span>
        <select class="input" name="userId">
          ${users.map(user => {
    return `<option value="${user.id}" ${user.id === 1 ? 'selected' : ''}>${user.name}</option>`
  })}
        </select>
      </label>
      <button class="button button_secondary edit-form__edit-button" type="submit">
        ${downloadIcon()}
        Import
      </button>
    </form>
  `;
}

function validation(name) {
  return `
    required 
    oninvalid="this.setCustomValidity('Please enter a valid ${name}');this.parentElement.classList.add('input_error')"
    oninput="this.setCustomValidity('');this.parentElement.classList.remove('input_error')"
  `;
}