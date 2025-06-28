import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { Group } from '../types/types';

export const getGroupStats = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    if (!groupId || !userId) {
      return res.status(400).json({ message: 'Group ID and user ID are required' });
    }

    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data() as Group;

    if (groupData.adminId !== userId) {
      return res.status(403).json({ message: 'Only group admin can view statistics' });
    }

    const postsRef = collection(db, 'Groups', groupId, 'Posts');
    const postsSnapshot = await getDocs(postsRef);

    const memberPostCounts = new Map<string, number>();
    const memberNames = new Map<string, string>();

    for (const memberId of groupData.members) {
      memberPostCounts.set(memberId, 0);
    }

    const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i}:00`,
      count: 0
    }));

    postsSnapshot.forEach((doc) => {
      const postData = doc.data();
      const currentCount = memberPostCounts.get(postData.userId) || 0;
      memberPostCounts.set(postData.userId, currentCount + 1);

      if (postData.createdAt) {
        const postDate = postData.createdAt.toDate();
        const hour = postDate.getHours();
        hourlyActivity[hour].count++;
      }
    });

    const memberPromises = groupData.members.map(async (memberId) => {
      const userRef = doc(db, 'Users', memberId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        memberNames.set(memberId, userDoc.data().fullName);
      }
    });

    await Promise.all(memberPromises);

    const memberActivity = Array.from(memberPostCounts.entries()).map(([memberId, postCount]) => ({
      memberId,
      memberName: memberNames.get(memberId) || 'Unknown User',
      postCount
    }));

    memberActivity.sort((a, b) => b.postCount - a.postCount);

    res.status(200).json({
      stats: {
        memberActivity,
        hourlyActivity,
        totalPosts: postsSnapshot.size,
        totalMembers: groupData.members.length
      }
    });
  } catch (error) {
    console.error('Error getting group statistics:', error);
    res.status(500).json({ message: 'Failed to get group statistics' });
  }
};
