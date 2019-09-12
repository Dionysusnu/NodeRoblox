const Base = require('./Base');
const Role = require('./Role');
const User = require('./User');

/**
 * Represents a user in a group
 */
class GroupMember extends Base {
	constructor(client, data, group) {
		super(client);
		/**
		 * @property {User} user The user
		 */
		Object.defineProperty(this, 'user', { value: new User(client, data.user) });
		/**
		 * @property {integer} id The id of the user
		 */
		Object.defineProperty(this, 'id', { value: this.user.id });
		/**
		 * @property {Group} group The group this member is part of
		 */
		Object.defineProperty(this, 'group', { value: group });
		/**
		 * @property {Role} role The current role of this member
		 */
		this.role = group.roles.get(data.role.id) || new Role(client, data.role, group);
	}

	/**
	 * Sets the member's role
	 * @param {Role} role The new role for this user
	 * @returns {GroupMember} This member, with the updated role
	 */
	async setRole(role) {
		const config = {
			method: 'patch',
			data: {
				roleId: role.id,
			},
		};
		await this.client.http(`https://groups.roblox.com/v1/groups/${this.group.id}/users/${this.user.id}`, config).catch(err => {
			switch(err.response.status) {
			case 400: {
				switch(err.response.data.errors[1].code) {
				case 1: {
					throw new Error('Group is invalid');
				}
				case 2: {
					throw new Error('Role is invalid');
				}
				case 3: {
					throw new Error('User is invalid');
				}
				}
				break;
			}
			case 403: {
				switch(err.response.data.errors[1].code) {
				case 4: {
					throw new Error('Lacking permissions');
				}
				}
				break;
			}
			}
			throw err;
		});
		this.role = role;
		return this;
	}
}

module.exports = GroupMember;