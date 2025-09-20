/**
 * Real-time Collaboration Engine
 * Provides live repository analysis, team collaboration, and real-time notifications
 */

import { EventEmitter } from 'events';
import type {
  CollaborationSession,
  TeamWorkspace,
  LiveAnalysis,
  NotificationEvent,
  UserPresence,
  CollaborativeAnnotation,
  SharedAnalysis,
  TeamActivity,
  RealTimeConfig
} from '../types';

export interface CollaborationConfig {
  enableLiveAnalysis?: boolean;
  enableTeamWorkspaces?: boolean;
  enableNotifications?: boolean;
  enableAnnotations?: boolean;
  enablePresenceTracking?: boolean;
  maxTeamSize?: number;
  sessionTimeout?: number;
  notificationRetention?: number;
  enableActivityTracking?: boolean;
}

export class RealTimeCollaborationEngine extends EventEmitter {
  private config: CollaborationConfig;
  private activeSessions: Map<string, CollaborationSession> = new Map();
  private teamWorkspaces: Map<string, TeamWorkspace> = new Map();
  private liveAnalyses: Map<string, LiveAnalysis> = new Map();
  private userPresence: Map<string, UserPresence> = new Map();
  private notifications: NotificationEvent[] = [];
  private annotations: Map<string, CollaborativeAnnotation[]> = new Map();
  private sharedAnalyses: Map<string, SharedAnalysis> = new Map();
  private teamActivities: TeamActivity[] = [];

  constructor(config: CollaborationConfig = {}) {
    super();
    this.config = {
      enableLiveAnalysis: true,
      enableTeamWorkspaces: true,
      enableNotifications: true,
      enableAnnotations: true,
      enablePresenceTracking: true,
      maxTeamSize: 50,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      notificationRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
      enableActivityTracking: true,
      ...config
    };

    this.startSessionCleanup();
    this.startNotificationCleanup();
  }

  /**
   * Create a new collaboration session
   */
  async createSession(
    sessionId: string,
    initiator: {
      userId: string;
      username: string;
      role: string;
    },
    options: {
      type: 'analysis' | 'review' | 'planning' | 'general';
      title?: string;
      description?: string;
      maxParticipants?: number;
      allowGuests?: boolean;
      enableRecording?: boolean;
    } = { type: 'general' }
  ): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: sessionId,
      type: options.type,
      title: options.title || `${options.type} Session`,
      description: options.description,
      initiator,
      participants: [initiator],
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      settings: {
        maxParticipants: options.maxParticipants || this.config.maxTeamSize!,
        allowGuests: options.allowGuests || false,
        enableRecording: options.enableRecording || false,
        isPublic: false,
        requireApproval: true
      },
      metadata: {
        messageCount: 0,
        fileCount: 0,
        analysisCount: 0,
        duration: 0
      }
    };

    this.activeSessions.set(sessionId, session);
    this.updateUserPresence(initiator.userId, {
      userId: initiator.userId,
      username: initiator.username,
      sessionId,
      status: 'active',
      lastSeen: new Date(),
      currentActivity: 'created_session'
    });

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'session_created',
      userId: initiator.userId,
      username: initiator.username,
      sessionId,
      details: { type: options.type, title: session.title },
      timestamp: new Date()
    });

    this.emit('session_created', session);
    console.log(`👥 Collaboration session created: ${sessionId} by ${initiator.username}`);

    return session;
  }

  /**
   * Join an existing collaboration session
   */
  async joinSession(
    sessionId: string,
    user: { userId: string; username: string; role: string }
  ): Promise<CollaborationSession | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    if (session.participants.length >= session.settings.maxParticipants) {
      throw new Error('Session is full');
    }

    if (!session.settings.allowGuests && user.role === 'guest') {
      throw new Error('Guests are not allowed in this session');
    }

    // Add user to session
    session.participants.push(user);
    session.lastActivity = new Date();

    this.updateUserPresence(user.userId, {
      userId: user.userId,
      username: user.username,
      sessionId,
      status: 'active',
      lastSeen: new Date(),
      currentActivity: 'joined_session'
    });

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'user_joined',
      userId: user.userId,
      username: user.username,
      sessionId,
      details: { previousCount: session.participants.length - 1 },
      timestamp: new Date()
    });

    this.emit('user_joined', { sessionId, user, session });
    console.log(`👤 ${user.username} joined session: ${sessionId}`);

    return session;
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(
    sessionId: string,
    userId: string
  ): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participantIndex = session.participants.findIndex(p => p.userId === userId);
    if (participantIndex === -1) {
      return false;
    }

    const user = session.participants[participantIndex];
    session.participants.splice(participantIndex, 1);
    session.lastActivity = new Date();

    // Update user presence
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.status = 'away';
      presence.currentActivity = 'left_session';
      presence.lastSeen = new Date();
    }

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'user_left',
      userId,
      username: user.username,
      sessionId,
      details: { remainingCount: session.participants.length },
      timestamp: new Date()
    });

    this.emit('user_left', { sessionId, userId, session });

    // End session if no participants left
    if (session.participants.length === 0) {
      await this.endSession(sessionId);
    }

    console.log(`👋 User ${userId} left session: ${sessionId}`);
    return true;
  }

  /**
   * End a collaboration session
   */
  async endSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.status = 'ended';
    session.lastActivity = new Date();

    // Update all participants' presence
    session.participants.forEach(participant => {
      const presence = this.userPresence.get(participant.userId);
      if (presence) {
        presence.status = 'away';
        presence.currentActivity = 'session_ended';
        presence.lastSeen = new Date();
      }
    });

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'session_ended',
      userId: session.initiator.userId,
      username: session.initiator.username,
      sessionId,
      details: { participantCount: session.participants.length },
      timestamp: new Date()
    });

    this.emit('session_ended', session);
    console.log(`🏁 Session ended: ${sessionId}`);

    return true;
  }

  /**
   * Start live repository analysis
   */
  async startLiveAnalysis(
    sessionId: string,
    repository: { owner: string; name: string },
    userId: string,
    options: {
      includeDependencies?: boolean;
      includeSecurity?: boolean;
      includePerformance?: boolean;
      realTimeUpdates?: boolean;
    } = {}
  ): Promise<LiveAnalysis> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const liveAnalysis: LiveAnalysis = {
      id: analysisId,
      sessionId,
      repository,
      initiator: userId,
      status: 'starting',
      progress: 0,
      currentStage: 'initializing',
      startedAt: new Date(),
      lastUpdate: new Date(),
      options,
      participants: session.participants.map(p => p.userId),
      results: null,
      error: null
    };

    this.liveAnalyses.set(analysisId, liveAnalysis);

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'analysis_started',
      userId,
      username: session.participants.find(p => p.userId === userId)?.username || 'Unknown',
      sessionId,
      details: { repository: `${repository.owner}/${repository.name}`, analysisId },
      timestamp: new Date()
    });

    this.emit('analysis_started', liveAnalysis);

    // Start analysis in background
    this.performLiveAnalysis(liveAnalysis);

    console.log(`🔍 Live analysis started: ${analysisId} for ${repository.owner}/${repository.name}`);
    return liveAnalysis;
  }

  /**
   * Create team workspace
   */
  async createTeamWorkspace(
    workspaceId: string,
    creator: { userId: string; username: string; role: string },
    options: {
      name: string;
      description?: string;
      isPublic?: boolean;
      maxMembers?: number;
      allowGuests?: boolean;
    }
  ): Promise<TeamWorkspace> {
    const workspace: TeamWorkspace = {
      id: workspaceId,
      name: options.name,
      description: options.description,
      creator,
      members: [creator],
      repositories: [],
      sharedAnalyses: [],
      settings: {
        isPublic: options.isPublic || false,
        maxMembers: options.maxMembers || this.config.maxTeamSize!,
        allowGuests: options.allowGuests || false,
        requireApproval: true,
        enableNotifications: true
      },
      activity: [],
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.teamWorkspaces.set(workspaceId, workspace);

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'workspace_created',
      userId: creator.userId,
      username: creator.username,
      details: { workspaceId, workspaceName: options.name },
      timestamp: new Date()
    });

    this.emit('workspace_created', workspace);
    console.log(`🏢 Team workspace created: ${workspaceId} by ${creator.username}`);

    return workspace;
  }

  /**
   * Add member to team workspace
   */
  async addWorkspaceMember(
    workspaceId: string,
    member: { userId: string; username: string; role: string },
    addedBy: string
  ): Promise<boolean> {
    const workspace = this.teamWorkspaces.get(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (workspace.members.length >= workspace.settings.maxMembers) {
      throw new Error('Workspace is full');
    }

    if (!workspace.settings.allowGuests && member.role === 'guest') {
      throw new Error('Guests are not allowed in this workspace');
    }

    workspace.members.push(member);
    workspace.lastActivity = new Date();

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'member_added',
      userId: addedBy,
      username: 'System', // Would be the actual user who added
      details: { workspaceId, memberId: member.userId, memberName: member.username },
      timestamp: new Date()
    });

    this.emit('member_added', { workspaceId, member, addedBy });
    console.log(`👤 ${member.username} added to workspace: ${workspaceId}`);

    return true;
  }

  /**
   * Share analysis in workspace
   */
  async shareAnalysis(
    workspaceId: string,
    analysis: SharedAnalysis,
    sharedBy: string
  ): Promise<boolean> {
    const workspace = this.teamWorkspaces.get(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    analysis.sharedAt = new Date();
    analysis.sharedBy = sharedBy;

    workspace.sharedAnalyses.push(analysis);
    workspace.lastActivity = new Date();

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'analysis_shared',
      userId: sharedBy,
      username: 'System',
      details: { workspaceId, analysisId: analysis.id, analysisType: analysis.type },
      timestamp: new Date()
    });

    this.emit('analysis_shared', { workspaceId, analysis, sharedBy });
    console.log(`📊 Analysis shared in workspace: ${workspaceId}`);

    return true;
  }

  /**
   * Send notification to users
   */
  async sendNotification(
    type: 'info' | 'warning' | 'error' | 'success',
    title: string,
    message: string,
    recipients: string[],
    options: {
      priority?: 'low' | 'medium' | 'high';
      category?: string;
      actionUrl?: string;
      metadata?: any;
    } = {}
  ): Promise<string> {
    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const notification: NotificationEvent = {
      id: notificationId,
      type,
      title,
      message,
      recipients,
      priority: options.priority || 'medium',
      category: options.category,
      actionUrl: options.actionUrl,
      metadata: options.metadata,
      createdAt: new Date(),
      readBy: [],
      status: 'sent'
    };

    this.notifications.push(notification);

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'notification_sent',
      userId: 'system',
      username: 'System',
      details: {
        notificationId,
        type,
        recipientCount: recipients.length,
        category: options.category
      },
      timestamp: new Date()
    });

    this.emit('notification_sent', notification);
    console.log(`📢 Notification sent: ${title} to ${recipients.length} recipients`);

    return notificationId;
  }

  /**
   * Add collaborative annotation
   */
  async addAnnotation(
    sessionId: string,
    annotation: Omit<CollaborativeAnnotation, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<CollaborativeAnnotation> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const fullAnnotation: CollaborativeAnnotation = {
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...annotation,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!this.annotations.has(sessionId)) {
      this.annotations.set(sessionId, []);
    }

    this.annotations.get(sessionId)!.push(fullAnnotation);

    this.logTeamActivity({
      id: `activity_${Date.now()}`,
      type: 'annotation_added',
      userId,
      username: 'System',
      sessionId,
      details: { annotationId: fullAnnotation.id, type: annotation.type },
      timestamp: new Date()
    });

    this.emit('annotation_added', { sessionId, annotation: fullAnnotation, userId });
    console.log(`📝 Annotation added to session: ${sessionId}`);

    return fullAnnotation;
  }

  /**
   * Get session participants
   */
  getSessionParticipants(sessionId: string): Array<{ userId: string; username: string; role: string }> {
    const session = this.activeSessions.get(sessionId);
    return session ? session.participants : [];
  }

  /**
   * Get user presence
   */
  getUserPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  /**
   * Get active sessions for user
   */
  getUserSessions(userId: string): CollaborationSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.participants.some(p => p.userId === userId));
  }

  /**
   * Get workspace members
   */
  getWorkspaceMembers(workspaceId: string): Array<{ userId: string; username: string; role: string }> {
    const workspace = this.teamWorkspaces.get(workspaceId);
    return workspace ? workspace.members : [];
  }

  /**
   * Get recent notifications
   */
  getRecentNotifications(userId: string, limit: number = 20): NotificationEvent[] {
    return this.notifications
      .filter(n => n.recipients.includes(userId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(notificationId: string, userId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification || !notification.recipients.includes(userId)) {
      return false;
    }

    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
    }

    return true;
  }

  /**
   * Get team activity
   */
  getTeamActivity(workspaceId?: string, limit: number = 50): TeamActivity[] {
    let activities = this.teamActivities;

    if (workspaceId) {
      activities = activities.filter(a => a.details?.workspaceId === workspaceId);
    }

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get collaboration statistics
   */
  getCollaborationStats(): {
    activeSessions: number;
    totalUsers: number;
    activeUsers: number;
    totalNotifications: number;
    unreadNotifications: number;
    teamWorkspaces: number;
  } {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const activeUsers = Array.from(this.userPresence.values())
      .filter(p => p.lastSeen > fiveMinutesAgo).length;

    const unreadNotifications = this.notifications
      .filter(n => n.readBy.length < n.recipients.length).length;

    return {
      activeSessions: Array.from(this.activeSessions.values()).filter(s => s.status === 'active').length,
      totalUsers: new Set(Array.from(this.userPresence.keys())).size,
      activeUsers,
      totalNotifications: this.notifications.length,
      unreadNotifications,
      teamWorkspaces: this.teamWorkspaces.size
    };
  }

  // Private methods
  private async performLiveAnalysis(liveAnalysis: LiveAnalysis): Promise<void> {
    try {
      // Import analysis services dynamically
      const { serviceContainer } = await import('./serviceContainer.js');
      const services = await serviceContainer.initialize();

      // Update progress
      const updateProgress = (progress: number, stage: string) => {
        liveAnalysis.progress = progress;
        liveAnalysis.currentStage = stage;
        liveAnalysis.lastUpdate = new Date();

        this.emit('analysis_progress', {
          analysisId: liveAnalysis.id,
          sessionId: liveAnalysis.sessionId,
          progress,
          stage,
          repository: liveAnalysis.repository
        });
      };

      updateProgress(10, 'Initializing analysis');

      // Perform Git analysis
      updateProgress(30, 'Analyzing Git history');
      const gitResult = await services.gitAnalyzer.analyzeRepository(
        liveAnalysis.repository.owner,
        liveAnalysis.repository.name
      );

      updateProgress(60, 'Processing results');

      // Perform dependency analysis if requested
      let dependencyResult = null;
      if (liveAnalysis.options.includeDependencies) {
        updateProgress(70, 'Analyzing dependencies');
        try {
          const { default: DependencyGraphAnalyzer } = await import('./dependencyGraphAnalyzer.js');
          const depAnalyzer = new DependencyGraphAnalyzer();
          dependencyResult = await depAnalyzer.analyzeDependencies(
            liveAnalysis.repository.owner,
            liveAnalysis.repository.name
          );
        } catch (error) {
          console.warn('Dependency analysis failed:', error);
        }
      }

      updateProgress(90, 'Finalizing analysis');

      // Store results
      liveAnalysis.status = 'completed';
      liveAnalysis.results = {
        gitAnalysis: gitResult.success ? gitResult.data || null : null,
        dependencyAnalysis: dependencyResult,
        completedAt: new Date()
      };

      updateProgress(100, 'Analysis complete');

      this.emit('analysis_completed', liveAnalysis);

      console.log(`✅ Live analysis completed: ${liveAnalysis.id}`);

    } catch (error) {
      console.error('Live analysis error:', error);

      liveAnalysis.status = 'failed';
      liveAnalysis.error = (error as Error).message;

      this.emit('analysis_failed', {
        analysisId: liveAnalysis.id,
        sessionId: liveAnalysis.sessionId,
        error: (error as Error).message
      });
    }
  }

  private updateUserPresence(userId: string, presence: UserPresence): void {
    this.userPresence.set(userId, presence);
    this.emit('presence_updated', { userId, presence });
  }

  private logTeamActivity(activity: TeamActivity): void {
    if (!this.config.enableActivityTracking) return;

    this.teamActivities.push(activity);

    // Keep only last 10000 activities
    if (this.teamActivities.length > 10000) {
      this.teamActivities = this.teamActivities.slice(-5000);
    }

    this.emit('activity_logged', activity);
  }

  private startSessionCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const timeout = this.config.sessionTimeout!;

      for (const [sessionId, session] of this.activeSessions.entries()) {
        if (now - session.lastActivity.getTime() > timeout) {
          console.log(`🧹 Cleaning up inactive session: ${sessionId}`);
          this.endSession(sessionId);
        }
      }
    }, 60000); // Check every minute
  }

  private startNotificationCleanup(): void {
    setInterval(() => {
      const retention = this.config.notificationRetention!;
      const cutoff = Date.now() - retention;

      this.notifications = this.notifications.filter(
        n => n.createdAt.getTime() > cutoff
      );

      console.log(`🧹 Cleaned up old notifications. Remaining: ${this.notifications.length}`);
    }, 3600000); // Check every hour
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.activeSessions.clear();
    this.teamWorkspaces.clear();
    this.liveAnalyses.clear();
    this.userPresence.clear();
    this.notifications.length = 0;
    this.annotations.clear();
    this.sharedAnalyses.clear();
    this.teamActivities.length = 0;

    this.removeAllListeners();
    console.log('🧹 Real-time collaboration engine destroyed');
  }
}

export default RealTimeCollaborationEngine;
