"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironmentConfig = exports.environments = void 0;
exports.environments = {
    development: {
        name: 'development',
        region: 'us-east-1',
        dynamodb: {
            billingMode: 'PAY_PER_REQUEST',
            pointInTimeRecovery: false,
            encryption: true,
        },
        s3: {
            versioning: false,
            lifecycleRules: true,
            encryption: true,
        },
        elasticache: {
            nodeType: 'cache.t3.micro',
            numNodes: 1,
        },
        opensearch: {
            instanceType: 't3.small.search',
            instanceCount: 1,
            ebsVolumeSize: 20,
        },
        lambda: {
            timeout: 30,
            memorySize: 256,
        },
        monitoring: {
            enableXRay: false,
            enableCloudWatch: true,
            logRetention: 7,
        },
    },
    staging: {
        name: 'staging',
        region: 'us-east-1',
        dynamodb: {
            billingMode: 'PAY_PER_REQUEST',
            pointInTimeRecovery: true,
            encryption: true,
        },
        s3: {
            versioning: true,
            lifecycleRules: true,
            encryption: true,
        },
        elasticache: {
            nodeType: 'cache.t3.small',
            numNodes: 1,
        },
        opensearch: {
            instanceType: 't3.medium.search',
            instanceCount: 2,
            ebsVolumeSize: 50,
        },
        lambda: {
            timeout: 60,
            memorySize: 512,
        },
        monitoring: {
            enableXRay: true,
            enableCloudWatch: true,
            logRetention: 30,
        },
    },
    production: {
        name: 'production',
        region: 'us-east-1',
        dynamodb: {
            billingMode: 'PAY_PER_REQUEST',
            pointInTimeRecovery: true,
            encryption: true,
        },
        s3: {
            versioning: true,
            lifecycleRules: true,
            encryption: true,
        },
        elasticache: {
            nodeType: 'cache.r6g.large',
            numNodes: 2,
        },
        opensearch: {
            instanceType: 'r6g.large.search',
            instanceCount: 3,
            ebsVolumeSize: 100,
        },
        lambda: {
            timeout: 300,
            memorySize: 1024,
        },
        monitoring: {
            enableXRay: true,
            enableCloudWatch: true,
            logRetention: 90,
        },
    },
};
function getEnvironmentConfig(env = 'development') {
    const config = exports.environments[env];
    if (!config) {
        throw new Error(`Environment configuration not found for: ${env}`);
    }
    return config;
}
exports.getEnvironmentConfig = getEnvironmentConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZW52aXJvbm1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQThDYSxRQUFBLFlBQVksR0FBc0M7SUFDN0QsV0FBVyxFQUFFO1FBQ1gsSUFBSSxFQUFFLGFBQWE7UUFDbkIsTUFBTSxFQUFFLFdBQVc7UUFFbkIsUUFBUSxFQUFFO1lBQ1IsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixtQkFBbUIsRUFBRSxLQUFLO1lBQzFCLFVBQVUsRUFBRSxJQUFJO1NBQ2pCO1FBRUQsRUFBRSxFQUFFO1lBQ0YsVUFBVSxFQUFFLEtBQUs7WUFDakIsY0FBYyxFQUFFLElBQUk7WUFDcEIsVUFBVSxFQUFFLElBQUk7U0FDakI7UUFFRCxXQUFXLEVBQUU7WUFDWCxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLFFBQVEsRUFBRSxDQUFDO1NBQ1o7UUFFRCxVQUFVLEVBQUU7WUFDVixZQUFZLEVBQUUsaUJBQWlCO1lBQy9CLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLGFBQWEsRUFBRSxFQUFFO1NBQ2xCO1FBRUQsTUFBTSxFQUFFO1lBQ04sT0FBTyxFQUFFLEVBQUU7WUFDWCxVQUFVLEVBQUUsR0FBRztTQUNoQjtRQUVELFVBQVUsRUFBRTtZQUNWLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsWUFBWSxFQUFFLENBQUM7U0FDaEI7S0FDRjtJQUVELE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLFdBQVc7UUFFbkIsUUFBUSxFQUFFO1lBQ1IsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixtQkFBbUIsRUFBRSxJQUFJO1lBQ3pCLFVBQVUsRUFBRSxJQUFJO1NBQ2pCO1FBRUQsRUFBRSxFQUFFO1lBQ0YsVUFBVSxFQUFFLElBQUk7WUFDaEIsY0FBYyxFQUFFLElBQUk7WUFDcEIsVUFBVSxFQUFFLElBQUk7U0FDakI7UUFFRCxXQUFXLEVBQUU7WUFDWCxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLFFBQVEsRUFBRSxDQUFDO1NBQ1o7UUFFRCxVQUFVLEVBQUU7WUFDVixZQUFZLEVBQUUsa0JBQWtCO1lBQ2hDLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLGFBQWEsRUFBRSxFQUFFO1NBQ2xCO1FBRUQsTUFBTSxFQUFFO1lBQ04sT0FBTyxFQUFFLEVBQUU7WUFDWCxVQUFVLEVBQUUsR0FBRztTQUNoQjtRQUVELFVBQVUsRUFBRTtZQUNWLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsWUFBWSxFQUFFLEVBQUU7U0FDakI7S0FDRjtJQUVELFVBQVUsRUFBRTtRQUNWLElBQUksRUFBRSxZQUFZO1FBQ2xCLE1BQU0sRUFBRSxXQUFXO1FBRW5CLFFBQVEsRUFBRTtZQUNSLFdBQVcsRUFBRSxpQkFBaUI7WUFDOUIsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixVQUFVLEVBQUUsSUFBSTtTQUNqQjtRQUVELEVBQUUsRUFBRTtZQUNGLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFVBQVUsRUFBRSxJQUFJO1NBQ2pCO1FBRUQsV0FBVyxFQUFFO1lBQ1gsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixRQUFRLEVBQUUsQ0FBQztTQUNaO1FBRUQsVUFBVSxFQUFFO1lBQ1YsWUFBWSxFQUFFLGtCQUFrQjtZQUNoQyxhQUFhLEVBQUUsQ0FBQztZQUNoQixhQUFhLEVBQUUsR0FBRztTQUNuQjtRQUVELE1BQU0sRUFBRTtZQUNOLE9BQU8sRUFBRSxHQUFHO1lBQ1osVUFBVSxFQUFFLElBQUk7U0FDakI7UUFFRCxVQUFVLEVBQUU7WUFDVixVQUFVLEVBQUUsSUFBSTtZQUNoQixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFlBQVksRUFBRSxFQUFFO1NBQ2pCO0tBQ0Y7Q0FDRixDQUFDO0FBRUYsU0FBZ0Isb0JBQW9CLENBQUMsTUFBYyxhQUFhO0lBQzlELE1BQU0sTUFBTSxHQUFHLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLEdBQUcsRUFBRSxDQUFDLENBQUM7S0FDcEU7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBTkQsb0RBTUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIEVudmlyb25tZW50Q29uZmlnIHtcbiAgbmFtZTogc3RyaW5nO1xuICBhY2NvdW50Pzogc3RyaW5nO1xuICByZWdpb246IHN0cmluZztcbiAgXG4gIC8vIER5bmFtb0RCIENvbmZpZ3VyYXRpb25cbiAgZHluYW1vZGI6IHtcbiAgICBiaWxsaW5nTW9kZTogJ1BBWV9QRVJfUkVRVUVTVCcgfCAnUFJPVklTSU9ORUQnO1xuICAgIHBvaW50SW5UaW1lUmVjb3Zlcnk6IGJvb2xlYW47XG4gICAgZW5jcnlwdGlvbjogYm9vbGVhbjtcbiAgfTtcbiAgXG4gIC8vIFMzIENvbmZpZ3VyYXRpb25cbiAgczM6IHtcbiAgICB2ZXJzaW9uaW5nOiBib29sZWFuO1xuICAgIGxpZmVjeWNsZVJ1bGVzOiBib29sZWFuO1xuICAgIGVuY3J5cHRpb246IGJvb2xlYW47XG4gIH07XG4gIFxuICAvLyBFbGFzdGlDYWNoZSBDb25maWd1cmF0aW9uXG4gIGVsYXN0aWNhY2hlOiB7XG4gICAgbm9kZVR5cGU6IHN0cmluZztcbiAgICBudW1Ob2RlczogbnVtYmVyO1xuICB9O1xuICBcbiAgLy8gT3BlblNlYXJjaCBDb25maWd1cmF0aW9uXG4gIG9wZW5zZWFyY2g6IHtcbiAgICBpbnN0YW5jZVR5cGU6IHN0cmluZztcbiAgICBpbnN0YW5jZUNvdW50OiBudW1iZXI7XG4gICAgZWJzVm9sdW1lU2l6ZTogbnVtYmVyO1xuICB9O1xuICBcbiAgLy8gTGFtYmRhIENvbmZpZ3VyYXRpb25cbiAgbGFtYmRhOiB7XG4gICAgdGltZW91dDogbnVtYmVyO1xuICAgIG1lbW9yeVNpemU6IG51bWJlcjtcbiAgfTtcbiAgXG4gIC8vIE1vbml0b3JpbmdcbiAgbW9uaXRvcmluZzoge1xuICAgIGVuYWJsZVhSYXk6IGJvb2xlYW47XG4gICAgZW5hYmxlQ2xvdWRXYXRjaDogYm9vbGVhbjtcbiAgICBsb2dSZXRlbnRpb246IG51bWJlcjtcbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IGVudmlyb25tZW50czogUmVjb3JkPHN0cmluZywgRW52aXJvbm1lbnRDb25maWc+ID0ge1xuICBkZXZlbG9wbWVudDoge1xuICAgIG5hbWU6ICdkZXZlbG9wbWVudCcsXG4gICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICBcbiAgICBkeW5hbW9kYjoge1xuICAgICAgYmlsbGluZ01vZGU6ICdQQVlfUEVSX1JFUVVFU1QnLFxuICAgICAgcG9pbnRJblRpbWVSZWNvdmVyeTogZmFsc2UsXG4gICAgICBlbmNyeXB0aW9uOiB0cnVlLFxuICAgIH0sXG4gICAgXG4gICAgczM6IHtcbiAgICAgIHZlcnNpb25pbmc6IGZhbHNlLFxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IHRydWUsXG4gICAgICBlbmNyeXB0aW9uOiB0cnVlLFxuICAgIH0sXG4gICAgXG4gICAgZWxhc3RpY2FjaGU6IHtcbiAgICAgIG5vZGVUeXBlOiAnY2FjaGUudDMubWljcm8nLFxuICAgICAgbnVtTm9kZXM6IDEsXG4gICAgfSxcbiAgICBcbiAgICBvcGVuc2VhcmNoOiB7XG4gICAgICBpbnN0YW5jZVR5cGU6ICd0My5zbWFsbC5zZWFyY2gnLFxuICAgICAgaW5zdGFuY2VDb3VudDogMSxcbiAgICAgIGVic1ZvbHVtZVNpemU6IDIwLFxuICAgIH0sXG4gICAgXG4gICAgbGFtYmRhOiB7XG4gICAgICB0aW1lb3V0OiAzMCxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICB9LFxuICAgIFxuICAgIG1vbml0b3Jpbmc6IHtcbiAgICAgIGVuYWJsZVhSYXk6IGZhbHNlLFxuICAgICAgZW5hYmxlQ2xvdWRXYXRjaDogdHJ1ZSxcbiAgICAgIGxvZ1JldGVudGlvbjogNyxcbiAgICB9LFxuICB9LFxuICBcbiAgc3RhZ2luZzoge1xuICAgIG5hbWU6ICdzdGFnaW5nJyxcbiAgICByZWdpb246ICd1cy1lYXN0LTEnLFxuICAgIFxuICAgIGR5bmFtb2RiOiB7XG4gICAgICBiaWxsaW5nTW9kZTogJ1BBWV9QRVJfUkVRVUVTVCcsXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxuICAgICAgZW5jcnlwdGlvbjogdHJ1ZSxcbiAgICB9LFxuICAgIFxuICAgIHMzOiB7XG4gICAgICB2ZXJzaW9uaW5nOiB0cnVlLFxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IHRydWUsXG4gICAgICBlbmNyeXB0aW9uOiB0cnVlLFxuICAgIH0sXG4gICAgXG4gICAgZWxhc3RpY2FjaGU6IHtcbiAgICAgIG5vZGVUeXBlOiAnY2FjaGUudDMuc21hbGwnLFxuICAgICAgbnVtTm9kZXM6IDEsXG4gICAgfSxcbiAgICBcbiAgICBvcGVuc2VhcmNoOiB7XG4gICAgICBpbnN0YW5jZVR5cGU6ICd0My5tZWRpdW0uc2VhcmNoJyxcbiAgICAgIGluc3RhbmNlQ291bnQ6IDIsXG4gICAgICBlYnNWb2x1bWVTaXplOiA1MCxcbiAgICB9LFxuICAgIFxuICAgIGxhbWJkYToge1xuICAgICAgdGltZW91dDogNjAsXG4gICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgfSxcbiAgICBcbiAgICBtb25pdG9yaW5nOiB7XG4gICAgICBlbmFibGVYUmF5OiB0cnVlLFxuICAgICAgZW5hYmxlQ2xvdWRXYXRjaDogdHJ1ZSxcbiAgICAgIGxvZ1JldGVudGlvbjogMzAsXG4gICAgfSxcbiAgfSxcbiAgXG4gIHByb2R1Y3Rpb246IHtcbiAgICBuYW1lOiAncHJvZHVjdGlvbicsXG4gICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICBcbiAgICBkeW5hbW9kYjoge1xuICAgICAgYmlsbGluZ01vZGU6ICdQQVlfUEVSX1JFUVVFU1QnLFxuICAgICAgcG9pbnRJblRpbWVSZWNvdmVyeTogdHJ1ZSxcbiAgICAgIGVuY3J5cHRpb246IHRydWUsXG4gICAgfSxcbiAgICBcbiAgICBzMzoge1xuICAgICAgdmVyc2lvbmluZzogdHJ1ZSxcbiAgICAgIGxpZmVjeWNsZVJ1bGVzOiB0cnVlLFxuICAgICAgZW5jcnlwdGlvbjogdHJ1ZSxcbiAgICB9LFxuICAgIFxuICAgIGVsYXN0aWNhY2hlOiB7XG4gICAgICBub2RlVHlwZTogJ2NhY2hlLnI2Zy5sYXJnZScsXG4gICAgICBudW1Ob2RlczogMixcbiAgICB9LFxuICAgIFxuICAgIG9wZW5zZWFyY2g6IHtcbiAgICAgIGluc3RhbmNlVHlwZTogJ3I2Zy5sYXJnZS5zZWFyY2gnLFxuICAgICAgaW5zdGFuY2VDb3VudDogMyxcbiAgICAgIGVic1ZvbHVtZVNpemU6IDEwMCxcbiAgICB9LFxuICAgIFxuICAgIGxhbWJkYToge1xuICAgICAgdGltZW91dDogMzAwLFxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcbiAgICB9LFxuICAgIFxuICAgIG1vbml0b3Jpbmc6IHtcbiAgICAgIGVuYWJsZVhSYXk6IHRydWUsXG4gICAgICBlbmFibGVDbG91ZFdhdGNoOiB0cnVlLFxuICAgICAgbG9nUmV0ZW50aW9uOiA5MCxcbiAgICB9LFxuICB9LFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVudmlyb25tZW50Q29uZmlnKGVudjogc3RyaW5nID0gJ2RldmVsb3BtZW50Jyk6IEVudmlyb25tZW50Q29uZmlnIHtcbiAgY29uc3QgY29uZmlnID0gZW52aXJvbm1lbnRzW2Vudl07XG4gIGlmICghY29uZmlnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFbnZpcm9ubWVudCBjb25maWd1cmF0aW9uIG5vdCBmb3VuZCBmb3I6ICR7ZW52fWApO1xuICB9XG4gIHJldHVybiBjb25maWc7XG59Il19