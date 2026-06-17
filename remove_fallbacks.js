const fs = require('fs');

const filesToFix = [
  'C:/projects/My SAas/super-app/src/app/admin/ai-analytics/page.tsx',
  'C:/projects/My SAas/super-app/src/app/admin/announcements/page.tsx',
  'C:/projects/My SAas/super-app/src/app/admin/employees/page.tsx',
  'C:/projects/My SAas/super-app/src/app/admin/parents/page.tsx',
  'C:/projects/My SAas/super-app/src/app/admin/students/page.tsx'
];

// Helper to remove function block safely
function removeFunction(code, funcName) {
  const regex = new RegExp(`const ${funcName}\\s*=\\s*\\(\\):?[^=]*=>\\s*\\[([\\s\\S]*?)\\];`, 'g');
  return code.replace(regex, '');
}

for (const file of filesToFix) {
  let data = fs.readFileSync(file, 'utf8');
  
  // Replace failure branches
  // e.g. } else { setEmployees(getFallbackEmployees()); }
  data = data.replace(/\} else \{\s*set[A-Za-z]+\(getFallback[A-Za-z]+\(\)\);\s*\}/g, '} else { console.error("API error"); }');
  
  // Replace catch branches
  // e.g. } catch { setEmployees(getFallbackEmployees()); }
  data = data.replace(/\} catch \{\s*set[A-Za-z]+\(getFallback[A-Za-z]+\(\)\);\s*\}/g, '} catch (err) { console.error("Network error:", err); }');
  
  // Remove the actual functions
  data = removeFunction(data, 'getFallbackEmployees');
  data = removeFunction(data, 'getFallbackStudents');
  data = removeFunction(data, 'getFallbackParents');
  data = removeFunction(data, 'getFallbackAnnouncements');
  data = removeFunction(data, 'getFallbackInsights');
  
  fs.writeFileSync(file, data);
}

// Now handle admin/page.tsx
const adminPage = 'C:/projects/My SAas/super-app/src/app/admin/page.tsx';
let adminData = fs.readFileSync(adminPage, 'utf8');

// Replace the fallback logic in fetchDashboardData
adminData = adminData.replace(/const fallback = getFallbackData\(\);/g, '');
adminData = adminData.replace(/const mergedModules = fallback\.quickModules[\s\S]*?return mod;\n\s*\}\);/g, '');

adminData = adminData.replace(/setDashboardData\(\{\s*\.\.\.fallback,\s*\.\.\.beData,\s*stats: \{\s*\.\.\.fallback\.stats,\s*\.\.\.\(beData\.stats \|\| \{\}\)\s*\},\s*quickModules: mergedModules,\s*recentActivities: beData\.recentActivities\?\.length \? beData\.recentActivities : fallback\.recentActivities,\s*revenueData: beData\.revenueData\?\.length \? beData\.revenueData : fallback\.revenueData,\s*gradeDistribution: beData\.gradeDistribution\?\.length \? beData\.gradeDistribution : fallback\.gradeDistribution,\s*performanceTrend: beData\.performanceTrend\?\.length \? beData\.performanceTrend : fallback\.performanceTrend,\s*departmentStats: beData\.departmentStats\?\.length \? beData\.departmentStats : fallback\.departmentStats,\s*\}\);/g, 
`setDashboardData({
          ...beData,
          stats: beData.stats || {},
          quickModules: beData.quickModules || [],
          recentActivities: beData.recentActivities || [],
          revenueData: beData.revenueData || [],
          gradeDistribution: beData.gradeDistribution || [],
          performanceTrend: beData.performanceTrend || [],
          departmentStats: beData.departmentStats || [],
        });`);

adminData = adminData.replace(/\} else \{\s*setDashboardData\(getFallbackData\(\)\);\s*\}/g, '} else { setError("Failed to fetch dashboard data."); }');
adminData = adminData.replace(/\} catch \{\s*setDashboardData\(getFallbackData\(\)\);\s*setError\("Backend disconnected\. Showing cached data\."\);\s*\}/g, '} catch (err) { setError("Backend disconnected."); }');

// Remove the fallback data generation function entirely
adminData = adminData.replace(/function getFallbackData\(\) \{[\s\S]*?\}\n/g, '');

// Handle initialization mapping
adminData = adminData.replace(/const data = dashboardData \|\| getFallbackData\(\);/g, 
`if (!dashboardData) return <div className="flex h-screen items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  const data = dashboardData;`);

fs.writeFileSync(adminPage, adminData);
console.log("Fallback logic removed from all pages.");
