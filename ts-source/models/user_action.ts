/// Can create users
export const CREATE_USER = 'create_user';

/// Can create games
export const CREATE_GAME = 'create_game';

/// Edit a users
export const EDIT_USER = 'edit_user';
/// Edit admin
export const EDIT_ADMIN = 'edit_admin';
/// Edit teacher
export const EDIT_TEACHER = 'edit_teacher';
/// Edit members
export const EDIT_MEMBER = 'edit_member';
/// Edit students
export const EDIT_STUDENT = 'edit_student';

/// Assign admin role
export const ASSIGN_ROLE_ADMIN = 'assign_role_admin';
/// Assign teacher role
export const ASSIGN_ROLE_TEACHER = 'assign_role_teacher';
/// Assign member role
export const ASSIGN_ROLE_MEMBER = 'assign_role_member';
/// Assign student role
export const ASSIGN_ROLE_STUDENT = 'assign_role_student';

/// Can see a users games
export const SEE_USER_GAMES = 'see_user_games';
/// Can see admin's games
export const SEE_ADMIN_GAMES = 'see_admin_games';
/// Can see teacher's games
export const SEE_TEACHER_GAMES = 'see_teacher_games';
/// Can see members' games
export const SEE_MEMBER_GAMES = 'see_member_games';
/// Can see student' games
export const SEE_STUDENT_GAMES = 'see_student_games';

/// Can challenge a user
export const CHALLENGE_USER = 'challenge_user';
/// Can see admin's games
export const CHALLENGE_ADMIN = 'challenge_admin';
/// Can see teacher's games
export const CHALLENGE_MEMBER = 'challenge_member';
/// Can see members' games
export const CHALLENGE_TEACHER = 'challenge_teacher';
/// Can see student' games
export const CHALLENGE_STUDENT = 'challenge_student';

/// All actions that can be performed in this web
export const all_actions = [
	CREATE_USER,
	CREATE_GAME,
	
	EDIT_USER,
	EDIT_ADMIN,
	EDIT_TEACHER,
	EDIT_MEMBER,
	EDIT_STUDENT,

	ASSIGN_ROLE_ADMIN,
	ASSIGN_ROLE_TEACHER,
	ASSIGN_ROLE_MEMBER,
	ASSIGN_ROLE_STUDENT,
	
	SEE_USER_GAMES,
	SEE_ADMIN_GAMES,
	SEE_TEACHER_GAMES,
	SEE_MEMBER_GAMES,
	SEE_STUDENT_GAMES,

	CHALLENGE_USER,
	CHALLENGE_ADMIN,
	CHALLENGE_MEMBER,
	CHALLENGE_TEACHER,
	CHALLENGE_STUDENT,

] as const;

/// All actions as type
export type UserAction = typeof all_actions[number];

